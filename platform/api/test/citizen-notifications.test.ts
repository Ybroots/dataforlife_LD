import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { FixtureDirectoryRepository } from '../src/fixture-repository.js';

let app: FastifyInstance | undefined;
afterEach(async () => { await app?.close(); app = undefined; });
const citizen = 'citizen-notification-test';
const actor = 'officer-demo-xuan-huong';
const headers = { 'x-citizen-id': citizen };

async function setup() {
  const repo = new FixtureDirectoryRepository();
  app = await buildApp(repo);
  const incident = await repo.createIncident(citizen, { clientRequestId: 'notification-test-001', category: 'security',
    summary: 'Phản ánh kiểm tra thông báo', description: 'Kiểm tra lịch sử thông báo gửi riêng theo tài khoản.',
    latitude: 11.944, longitude: 108.441, attachments: [] });
  return { repo, incident };
}

describe('citizen notifications', () => {
  it('notifies officer status updates but never exposes internal notes or own messages', async () => {
    const { repo, incident } = await setup();
    await repo.transitionIncident(actor, incident.id, 'received', 'INTERNAL_SECRET', null, false);
    await repo.addCitizenIncidentMessage(citizen, incident.receiptCode, 'Tin của chính người dân');
    await repo.addOfficerIncidentMessage(actor, incident.id, 'Vui lòng bổ sung ảnh hiện trường.', true);
    const response = await app!.inject({ method: 'GET', url: '/v1/citizen/notifications', headers });
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain('INTERNAL_SECRET');
    expect(response.body).not.toContain('Tin của chính người dân');
    expect(response.json().data.unreadCount).toBe(2);
    expect(response.json().data.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ receiptCode: incident.receiptCode, status: 'received', message: null }),
      expect.objectContaining({ eventType: 'request_media', message: 'Vui lòng bổ sung ảnh hiện trường.' }),
    ]));
  });

  it('requires login and isolates both inbox and read acknowledgement', async () => {
    const { repo, incident } = await setup();
    await repo.transitionIncident(actor, incident.id, 'received', 'Đã tiếp nhận', null, true);
    const own = await repo.listCitizenNotifications(citizen, { limit: 30 });
    const id = own.items[0]!.id;
    expect((await app!.inject('/v1/citizen/notifications')).statusCode).toBe(401);
    expect((await app!.inject({ method: 'POST', url: '/v1/citizen/notifications/read', payload: { ids: [id] } })).statusCode).toBe(401);
    const otherHeaders = { 'x-citizen-id': 'another-citizen' };
    const other = await app!.inject({ method: 'GET', url: '/v1/citizen/notifications', headers: otherHeaders });
    expect(other.json().data).toEqual({ items: [], unreadCount: 0, nextCursor: null });
    const foreignRead = await app!.inject({ method: 'POST', url: '/v1/citizen/notifications/read', headers: otherHeaders, payload: { ids: [id] } });
    expect(foreignRead.json().data.updated).toBe(0);
    expect((await repo.listCitizenNotifications(citizen, { limit: 30 })).unreadCount).toBe(1);
    const first = await app!.inject({ method: 'POST', url: '/v1/citizen/notifications/read', headers, payload: { ids: [id, id] } });
    expect(first.json().data.updated).toBe(1);
    const again = await app!.inject({ method: 'POST', url: '/v1/citizen/notifications/read', headers, payload: { ids: [id] } });
    expect(again.json().data.updated).toBe(0);
    expect((await repo.listCitizenNotifications(citizen, { limit: 30 })).items[0]!.readAt).not.toBeNull();
  });

  it('paginates without duplicates, keeps concurrent updates unread and supports SOS', async () => {
    const { repo, incident } = await setup();
    await repo.transitionIncident(actor, incident.id, 'received', 'Tiếp nhận', null, true);
    await repo.transitionIncident(actor, incident.id, 'assigned', 'Đã phân công', null, true);
    const first = await repo.listCitizenNotifications(citizen, { limit: 1 });
    expect(first.nextCursor).not.toBeNull();
    const second = await repo.listCitizenNotifications(citizen, { limit: 1, cursor: first.nextCursor! });
    expect(second.items[0]!.id).not.toBe(first.items[0]!.id);
    expect(second.nextCursor).toBeNull();
    const sos = await repo.createSos(citizen, { idempotencyKey: 'notification-sos-test', category: 'security', latitude: 11.944, longitude: 108.441, deviceTimestamp: new Date().toISOString() });
    await repo.transitionSos(actor, sos.id, 'acknowledged', 'Ghi chú riêng SOS', null, false);
    await repo.markCitizenNotificationsRead(citizen, [first.items[0]!.id, second.items[0]!.id]);
    const remaining = await repo.listCitizenNotifications(citizen, { limit: 30, unreadOnly: true });
    expect(remaining.unreadCount).toBe(1);
    expect(remaining.items).toMatchObject([{ kind: 'sos', receiptCode: sos.receiptCode, status: 'acknowledged', message: null }]);
    expect((await repo.listCitizenNotifications(citizen, { limit: 30 })).items).toHaveLength(3);
  });

  it('validates pagination and read inputs', async () => {
    await setup();
    for (const query of ['limit=0', 'limit=101', 'cursor=invalid', 'unread=yes']) {
      expect((await app!.inject({ method: 'GET', url: `/v1/citizen/notifications?${query}`, headers })).statusCode).toBe(400);
    }
    for (const ids of [[], ['bad'], Array(101).fill('incident:1')]) {
      expect((await app!.inject({ method: 'POST', url: '/v1/citizen/notifications/read', headers, payload: { ids } })).statusCode).toBe(400);
    }
  });

  it('opens a specific SOS without exposing internal notes or another citizen request', async () => {
    const { repo } = await setup();
    const sos = await repo.createSos(citizen, { idempotencyKey: 'notification-old-sos', category: 'security', latitude: 11.944, longitude: 108.441, deviceTimestamp: new Date().toISOString() });
    await repo.transitionSos(actor, sos.id, 'acknowledged', 'PRIVATE_SOS_NOTE', null, false);
    const url = `/v1/citizen/sos/${sos.receiptCode}`;
    const response = await app!.inject({ method: 'GET', url, headers });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.receiptCode).toBe(sos.receiptCode);
    expect(response.body).not.toContain('PRIVATE_SOS_NOTE');
    expect((await app!.inject({ method: 'GET', url, headers: { 'x-citizen-id': 'another-citizen' } })).statusCode).toBe(404);
    expect((await app!.inject(url)).statusCode).toBe(401);
  });
});
