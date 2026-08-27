import type { Pool } from 'pg';
import type { CitizenNotification, CitizenNotificationPage, NotificationQuery } from './types.js';

export function notificationTitle(kind: 'incident' | 'sos', status: string | null, eventType: string): string {
  if (eventType === 'request_media') return 'Cán bộ yêu cầu bổ sung thông tin';
  if (eventType === 'message') return 'Cán bộ đã gửi trao đổi';
  const labels: Record<string, string> = kind === 'incident' ? {
    received: 'Phản ánh đã được tiếp nhận', assigned: 'Đã phân công cán bộ xử lý',
    verifying: 'Phản ánh đang được xác minh', processing: 'Phản ánh đang được xử lý',
    resolved: 'Phản ánh đã có kết quả', closed: 'Phản ánh đã hoàn tất', rejected: 'Phản ánh đã bị từ chối',
  } : {
    acknowledged: 'Cán bộ đã tiếp nhận SOS', responding: 'Cán bộ đang hỗ trợ yêu cầu SOS',
    escalated: 'SOS đã được chuyển xử lý ưu tiên', resolved: 'Yêu cầu SOS đã được xử lý',
    closed: 'Yêu cầu SOS đã hoàn tất', dispatched: 'SOS đã được đưa lại vào hàng đợi',
  };
  return labels[status ?? ''] ?? 'Cán bộ đã cập nhật hồ sơ';
}

export function paginateNotifications(items: CitizenNotification[], query: NotificationQuery): CitizenNotificationPage {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  const unreadCount = sorted.filter((item) => !item.readAt).length;
  const start = query.cursor ? sorted.findIndex((item) => item.id === query.cursor) + 1 : 0;
  const remaining = query.cursor && start === 0 ? [] : sorted.slice(start).filter((item) => !query.unreadOnly || !item.readAt);
  const page = remaining.slice(0, query.limit);
  return { items: page, unreadCount, nextCursor: remaining.length > query.limit ? page.at(-1)!.id : null };
}

export class CitizenNotificationStore {
  constructor(private readonly pool: Pool) {}

  async list(citizenId: string, query: NotificationQuery): Promise<CitizenNotificationPage> {
    // One snapshot for the list and unread count; ownership applies before pagination.
    const result = await this.pool.query(
      `WITH owned AS MATERIALIZED (
         SELECT n.*, r.read_at FROM citizen_notification_events n
         LEFT JOIN citizen_notification_reads r ON r.citizen_id=n.citizen_id AND r.notification_id=n.id
         WHERE n.citizen_id=$1
       ), page AS (
         SELECT * FROM owned
         WHERE (NOT $4::boolean OR read_at IS NULL)
           AND ($2::text IS NULL OR (created_at, id COLLATE "C") <
             (SELECT created_at, id COLLATE "C" FROM owned WHERE id=$2))
         ORDER BY created_at DESC, id COLLATE "C" DESC LIMIT $3
       ) SELECT COALESCE((SELECT jsonb_agg(p ORDER BY p.created_at DESC, p.id COLLATE "C" DESC) FROM page p),'[]') AS items,
                (SELECT count(*)::int FROM owned WHERE read_at IS NULL) AS unread_count`,
      [citizenId, query.cursor ?? null, query.limit + 1, Boolean(query.unreadOnly)],
    );
    const rows = result.rows[0].items as Array<Record<string, string | null>>;
    const items: CitizenNotification[] = rows.slice(0, query.limit).map((row) => ({
      id: row.id!, kind: row.kind as 'incident' | 'sos', receiptCode: row.receipt_code!, caseTitle: row.case_title!,
      status: row.status ?? null, eventType: row.event_type as CitizenNotification['eventType'],
      title: notificationTitle(row.kind as 'incident' | 'sos', row.status ?? null, row.event_type!),
      message: row.message ?? null, createdAt: new Date(row.created_at!).toISOString(),
      readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
    }));
    return { items, unreadCount: result.rows[0].unread_count, nextCursor: rows.length > query.limit ? items.at(-1)!.id : null };
  }

  async markRead(citizenId: string, ids: string[]): Promise<number> {
    // Only explicitly displayed notification IDs are acknowledged. Concurrent new
    // updates stay unread, even when the citizen chooses "read all".
    const result = await this.pool.query(
      `INSERT INTO citizen_notification_reads (citizen_id, notification_id)
       SELECT citizen_id, id FROM citizen_notification_events WHERE citizen_id=$1 AND id=ANY($2::text[])
       ON CONFLICT (citizen_id, notification_id) DO NOTHING RETURNING notification_id`,
      [citizenId, ids],
    );
    return result.rowCount ?? 0;
  }
}
