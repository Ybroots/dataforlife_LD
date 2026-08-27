import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, deleteApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { applyCanonicalPlan } from './apply.js';
import { buildCanonicalPlan } from './transform.js';
import type { FirestoreCommune, FirestoreContact, GeoJSONCollection } from './types.js';

function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), '../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

async function main(): Promise<void> {
  loadLocalEnv();
  const apply = process.argv.includes('--apply');
  const confirmIndex = process.argv.indexOf('--confirm');
  const confirmation = confirmIndex >= 0 ? process.argv[confirmIndex + 1] : undefined;

  if (apply && confirmation !== 'canonical-v1') {
    throw new Error('Apply requires the explicit arguments: --apply --confirm canonical-v1');
  }

  const app = initializeApp({
    apiKey: required('FIREBASE_API_KEY'),
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: required('FIREBASE_PROJECT_ID'),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: required('FIREBASE_APP_ID'),
  }, `canonical-migration-${Date.now()}`);

  try {
    const firestore = getFirestore(app);
    const contactsCollection = process.env.FIRESTORE_CONTACTS_COLLECTION || 'contacts';
    const communesCollection = process.env.FIRESTORE_COMMUNES_COLLECTION || 'communes';
    const [contactSnapshot, communeSnapshot] = await Promise.all([
      getDocs(collection(firestore, contactsCollection)),
      getDocs(collection(firestore, communesCollection)),
    ]);

    const contacts = contactSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreContact[];
    const communes = communeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreCommune[];
    const geojsonPath = path.resolve(process.cwd(), process.env.MAP_GEOJSON_PATH || '../../map34.json');
    const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8')) as GeoJSONCollection;
    const plan = buildCanonicalPlan(communes, contacts, geojson);

    console.log(JSON.stringify({
      mode: apply ? 'apply' : 'plan',
      summary: plan.summary,
      issues: plan.issues,
    }, null, 2));

    if (!apply) {
      console.log('\nDry-run only. Firestore and PostGIS were not modified.');
      return;
    }

    const errorCount = plan.summary.errors ?? 0;
    if (errorCount > 0) {
      throw new Error(`Migration has ${errorCount} blocking data errors.`);
    }

    await applyCanonicalPlan(required('DATABASE_URL'), plan);
    console.log('\nCanonical migration committed successfully. Firestore was not modified.');
  } finally {
    await deleteApp(app);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
