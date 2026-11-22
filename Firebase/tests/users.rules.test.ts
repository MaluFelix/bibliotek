
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  setupRulesTest,
  authedDb,
  unauthedDb,
  seedDocument,
  validUserData,
  today,
  Timestamp,
} from './helpers';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

setupRulesTest();

// ============================================
// READ ACCESS
// ============================================

test('should deny unauthenticated users from reading user data', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = unauthedDb();
  const userRef = doc(db, 'users/user-a');

  await assertFails(getDoc(userRef));
});

test('should deny users from reading another users data', async () => {
  await seedDocument('users/user-b', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-b');

  await assertFails(getDoc(userRef));
});

test('should allow users to read their own data', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertSucceeds(getDoc(userRef));
});

// ============================================
// CREATE ACCESS
// ============================================

test('should deny unauthenticated users from creating user data', async () => {
  const db = unauthedDb();
  const userRef = doc(db, 'users/user-a');

  await assertFails(setDoc(userRef, validUserData()));
});

test('should deny users from creating data for another user', async () => {
  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-b');

  await assertFails(setDoc(userRef, validUserData()));
});

test('should deny creating user data with an invalid goal', async () => {
  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  const invalidUser = {
    ...validUserData(),
    goal: {
      year: new Date().getFullYear(),
      target: 0,
    },
  };

  await assertFails(setDoc(userRef, invalidUser));
});

test('should deny creating user data with invalid AI preferences', async () => {
  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  const invalidUser = {
    ...validUserData(),
    aiPreferences: {
      allowReviewAnalysis: 'yes',
      allowReviewAnalysisAt: null,
    },
  };

  await assertFails(setDoc(userRef, invalidUser));
});

test('should deny creating user data with unknown fields', async () => {
  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  const invalidUser = {
    ...validUserData(),
    admin: true,
  };

  await assertFails(setDoc(userRef, invalidUser));
});

test('should allow users to create their own valid user data', async () => {
  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertSucceeds(setDoc(userRef, validUserData()));
});

// ============================================
// UPDATE ACCESS
// ============================================

test('should deny unauthenticated users from updating user data', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = unauthedDb();
  const userRef = doc(db, 'users/user-a');

  await assertFails(
    updateDoc(userRef, {
      displayName: 'Updated Name',
    }),
  );
});

test('should deny users from updating another users data', async () => {
  await seedDocument('users/user-b', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-b');

  await assertFails(
    updateDoc(userRef, {
      displayName: 'Updated Name',
    }),
  );
});

test('should deny updating user data with an invalid goal', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertFails(
    updateDoc(userRef, {
      goal: {
        year: new Date().getFullYear(),
        target: -1,
      },
    }),
  );
});

test('should deny updating user data with invalid AI preferences', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertFails(
    updateDoc(userRef, {
      aiPreferences: {
        allowReviewAnalysis: true,
        allowReviewAnalysisAt: null,
      },
    }),
  );
});

test('should deny updating user data with unknown fields', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertFails(
    updateDoc(userRef, {
      admin: true,
    }),
  );
});

test('should allow users to update their own valid user data', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertSucceeds(
    updateDoc(userRef, {
      displayName: 'Updated Name',
    }),
  );
});

// ============================================
// DELETE ACCESS
// ============================================

test('should deny unauthenticated users from deleting user data', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = unauthedDb();
  const userRef = doc(db, 'users/user-a');

  await assertFails(deleteDoc(userRef));
});

test('should deny users from deleting another users data', async () => {
  await seedDocument('users/user-b', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-b');

  await assertFails(deleteDoc(userRef));
});

test('should allow users to delete their own user data', async () => {
  await seedDocument('users/user-a', validUserData());

  const db = authedDb('user-a');
  const userRef = doc(db, 'users/user-a');

  await assertSucceeds(deleteDoc(userRef));
});
