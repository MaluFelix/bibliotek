import { readFileSync } from 'node:fs';
import { before, after, beforeEach } from 'node:test';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const PROJECT_ID = 'bibliotek-e9bbd';
const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8080;

let testEnv: RulesTestEnvironment;

export function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validUserData() {
  return {
    displayName: 'Test User',
    createdAt: Timestamp.now(),
    goal: { year: new Date().getFullYear(), target: 20 },
    aiPreferences: { allowReviewAnalysis: false, allowReviewAnalysisAt: null },
  };
}

export function validBookData() {
  return {
    title: 'Test Book', author: 'Test Author', coverUrl: null, genre: null, externalId: null,
    source: 'manual', status: 'reading', pageCount: 300, currentPage: 0, startedAt: today(), finishedAt: null,
    rating: null, review: null, wouldRecommend: null, lastReadingId: null, lastReadingDate: null,
    addedAt: Timestamp.now(), updatedAt: Timestamp.now(),
  };
}

export function authedDb(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

export function unauthedDb() {
  return testEnv.unauthenticatedContext().firestore();
}

export async function seedDocument(path: string, data: object) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

export function setupRulesTest() {
  before(async () => {
    const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: { host: FIRESTORE_HOST, port: FIRESTORE_PORT, rules },
    });
  });
  beforeEach(async () => { await testEnv.clearFirestore(); });
  after(async () => { await testEnv.cleanup(); });
}

export { Timestamp };
