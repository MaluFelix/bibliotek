
import { test } from 'node:test';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  setupRulesTest,
  authedDb,
  unauthedDb,
} from './helpers';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

setupRulesTest();

test('should deny users from creating notes for another user', async () => {
  const db = authedDb('user-a');
  const noteRef = doc(db, 'users/user-b/notes/note-1');

  await assertFails(setDoc(noteRef, {}));
});

test('should deny unauthenticated users from reading notes', async () => {
  const db = unauthedDb();
  const noteRef = doc(db, 'users/user-b/notes/note-1');

  await assertFails(getDoc(noteRef));
});

test('should deny users from reading another users notes', async () => {
  const db = authedDb('user-a');
  const noteRef = doc(db, 'users/user-b/notes/note-1');

  await assertFails(getDoc(noteRef));
});

test('should deny unauthenticated users from creating notes', async () => {
  const db = unauthedDb();
  const noteRef = doc(db, 'users/user-a/notes/note-1');

  await assertFails(setDoc(noteRef, {}));
});

test('should deny unauthenticated users from updating notes', async () => {
  const db = unauthedDb();
  const noteRef = doc(db, 'users/user-a/notes/note-1');

  await assertFails(updateDoc(noteRef, { title: 'Updated note' }));
});

test('should deny unauthenticated users from deleting notes', async () => {
  const db = unauthedDb();
  const noteRef = doc(db, 'users/user-a/notes/note-1');

  await assertFails(deleteDoc(noteRef));
});

test('should deny users from updating another users notes', async () => {
  const db = authedDb('user-a');
  const noteRef = doc(db, 'users/user-b/notes/note-1');

  await assertFails(updateDoc(noteRef, { title: 'Updated note' }));
});

test('should deny users from deleting another users notes', async () => {
  const db = authedDb('user-a');
  const noteRef = doc(db, 'users/user-b/notes/note-1');

  await assertFails(deleteDoc(noteRef));
});
