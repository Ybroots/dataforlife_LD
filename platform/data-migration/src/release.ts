import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, getDocs, getFirestore, terminate } from 'firebase/firestore';
import { applyCanonicalPlan } from './apply.js';
import { buildCanonicalPlan } from './transform.js';
import type { CanonicalPlan, FirestoreCommune, FirestoreContact } from './types.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const [mode, snapshotPath, confirmation] = process.argv.slice(2);
if (!snapshotPath || !['export', 'apply'].includes(mode ?? '')) {
  throw new Error('Usage: release.ts export <private-snapshot.json> | apply <snapshot.json> <sha256>');
}

function validate(plan: CanonicalPlan) {
  const expected = { localities: 124, boundaries: 124, units: 136, stations: 126, directoryEntries: 296, hotlineCategories: 4, hotlines: 34 };
  for (const [key, count] of Object.entries(expected)) {
    const items = plan[key as keyof typeof expected];
    if (!Array.isArray(items) || items.length !== count || plan.summary[key] !== count) throw new Error(`Source baseline mismatch: ${key}`);
  }
  if (plan.summary.errors || plan.issues.some(issue => issue.severity === 'error')) throw new Error('Blocking source errors');
  const codes = new Set(plan.localities.map(item => item.code));
  if (codes.size !== 124 || new Set(plan.boundaries.map(item => item.localityCode)).size !== 124
    || plan.boundaries.some(item => !codes.has(item.localityCode))) throw new Error('Boundary/locality coverage mismatch');
}

if (mode === 'export') {
  // Use the original app's existing configuration without copying credentials
  // into snapshots, command lines, logs or the production environment.
  const source = fs.readFileSync(path.join(root, 'src/config/firebase.local.ts'), 'utf8');
  const config: Record<string, string> = {};
  for (const key of ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']) {
    const match = source.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
    if (match) config[key] = match[1]!;
  }
  if (!config.apiKey || !config.projectId) throw new Error('Source configuration unavailable');
  const app = initializeApp(config, 'release-source-readonly');
  const db = getFirestore(app);
  try {
    const [communes, contacts] = await Promise.all([getDocs(collection(db, 'communes')), getDocs(collection(db, 'contacts'))]);
    const plan = buildCanonicalPlan(
      communes.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreCommune[],
      contacts.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreContact[],
      JSON.parse(fs.readFileSync(path.join(root, 'map34.json'), 'utf8')),
    );
    validate(plan);
    const content = JSON.stringify(plan);
    fs.writeFileSync(snapshotPath, content, { mode: 0o600, flag: 'wx' });
    console.log(JSON.stringify({ summary: plan.summary, sha256: createHash('sha256').update(content).digest('hex') }));
  } finally { await terminate(db); await deleteApp(app); }
} else {
  const content = fs.readFileSync(snapshotPath);
  if (!confirmation || createHash('sha256').update(content).digest('hex') !== confirmation) throw new Error('Snapshot checksum does not match approval');
  const plan = JSON.parse(content.toString('utf8')) as CanonicalPlan;
  validate(plan);
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
  await applyCanonicalPlan(process.env.DATABASE_URL, plan, { retireFixtures: true });
  console.log(JSON.stringify({ applied: true, summary: plan.summary }));
}
