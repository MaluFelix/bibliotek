import { test } from 'node:test';
import { assertFails } from '@firebase/rules-unit-testing';
import { setupRulesTest, authedDb, today, Timestamp } from './helpers';
import { doc, setDoc } from 'firebase/firestore';

setupRulesTest();

test('should reject a reading log with zero total pages', async () => {
  const db = authedDb('user-a');
  const logRef = doc(
    db,
    `users/user-a/readingLogs/${today()}`
  );

  const log = {
    date: today(),
    books: {
      'book-1': 0,
    },
    totalPages: 0,
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(logRef, log));
});

test('should reject a reading log whose date does not match its document ID', async () => {
  const db = authedDb('user-a');
  const logRef = doc(
    db,
    `users/user-a/readingLogs/${today()}`
  );

  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  const dateString = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, '0'),
    String(yesterday.getDate()).padStart(2, '0'),
  ].join('-');

  const log = {
    date: dateString,
    books: {
      'book-1': 10,
    },
    totalPages: 10,
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(logRef, log));

});

/* test('should reject a reading log with negative pages for a book', async () => {
  const db = authedDb('user-a');
  const logRef = doc(
    db,
    `users/user-a/readingLogs/${today()}`
  );

  const log = {
    date: today(),
    books: {
      'book-1': -5,
    },
    totalPages: 10,
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(logRef, log));
}); */

/* test('should reject a reading log with fractional pages for a book', async () => {
  const db = authedDb('user-a');

  const logRef = doc(
    db,
    `users/user-a/readingLogs/${today()}`
  );

  const log = {
    date: today(),
    books: {
      'book-1': 2.5,
    },
    totalPages: 3,
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(logRef, log));
});

test('should reject a reading log when totalPages does not match the sum of books', async () => {
  const db = authedDb('user-a');

  const logRef = doc(
    db,
    `users/user-a/readingLogs/${today()}`
  );

  const log = {
    date: today(),
    books: {
      'book-1': 20,
    },
    totalPages: 999,
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(logRef, log));
});
 */