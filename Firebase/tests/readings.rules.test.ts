
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  setupRulesTest,
  authedDb,
  unauthedDb,
  seedDocument,
  validBookData,
  today,
  Timestamp,
} from './helpers';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

setupRulesTest();

// ============================================
// READ ACCESS
// ============================================

test('should deny unauthenticated users from reading a reading session', async () => {
  await seedDocument(
    'users/user-a/books/book-1',
    validBookData(),
  );

  await seedDocument(
    'users/user-a/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 0,
      toPage: 10,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = unauthedDb();
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );

  await assertFails(getDoc(readingRef));
});

test('should deny users from reading another users reading sessions', async () => {
  await seedDocument(
    'users/user-b/books/book-1',
    validBookData(),
  );

  await seedDocument(
    'users/user-b/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 0,
      toPage: 10,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = authedDb('user-a');
  const readingRef = doc(
    db,
    'users/user-b/books/book-1/readings/reading-1',
  );

  await assertFails(getDoc(readingRef));
});

// ============================================
// CREATE ACCESS
// ============================================

test('should deny users from creating reading sessions for another user', async () => {
  await seedDocument(
    'users/user-b/books/book-1',
    validBookData(),
  );

  const db = authedDb('user-a');
  const readingRef = doc(
    db,
    'users/user-b/books/book-1/readings/reading-1',
  );

  const reading = {
    date: today(),
    fromPage: 0,
    toPage: 10,
    pages: 10,
    previousId: null,
    voided: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(readingRef, reading));
});

test('should deny unauthenticated users from creating reading sessions', async () => {
  await seedDocument(
    'users/user-a/books/book-1',
    validBookData(),
  );

  const db = unauthedDb();
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );

  const reading = {
    date: today(),
    fromPage: 0,
    toPage: 10,
    pages: 10,
    previousId: null,
    voided: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await assertFails(setDoc(readingRef, reading));
});

// ============================================
// UPDATE ACCESS
// ============================================

test('should deny users from updating another users reading sessions', async () => {
  const book = validBookData();

  book.currentPage = 20;
  book.lastReadingId = 'reading-1';
  book.lastReadingDate = today();

  await seedDocument(
    'users/user-b/books/book-1',
    book,
  );

  await seedDocument(
    'users/user-b/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 10,
      toPage: 20,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = authedDb('user-a');
  const readingRef = doc(
    db,
    'users/user-b/books/book-1/readings/reading-1',
  );

  await assertFails(
    updateDoc(readingRef, {
      toPage: 30,
      pages: 20,
      updatedAt: Timestamp.now(),
    }),
  );
});

test('should deny unauthenticated users from updating reading sessions', async () => {
  const book = validBookData();

  book.currentPage = 20;
  book.lastReadingId = 'reading-1';
  book.lastReadingDate = today();

  await seedDocument(
    'users/user-a/books/book-1',
    book,
  );

  await seedDocument(
    'users/user-a/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 10,
      toPage: 20,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = unauthedDb();
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );

  await assertFails(
    updateDoc(readingRef, {
      toPage: 30,
      pages: 20,
      updatedAt: Timestamp.now(),
    }),
  );
});

// ============================================
// DELETE ACCESS
// ============================================

test('should deny users from deleting another users reading sessions', async () => {
  const book = validBookData();

  book.currentPage = 20;
  book.lastReadingId = 'reading-1';
  book.lastReadingDate = today();

  await seedDocument(
    'users/user-b/books/book-1',
    book,
  );

  await seedDocument(
    'users/user-b/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 10,
      toPage: 20,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = authedDb('user-a');
  const readingRef = doc(
    db,
    'users/user-b/books/book-1/readings/reading-1',
  );

  await assertFails(deleteDoc(readingRef));
});

test('should deny unauthenticated users from deleting reading sessions', async () => {
  const book = validBookData();

  book.currentPage = 20;
  book.lastReadingId = 'reading-1';
  book.lastReadingDate = today();

  await seedDocument(
    'users/user-a/books/book-1',
    book,
  );

  await seedDocument(
    'users/user-a/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 10,
      toPage: 20,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = unauthedDb();
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );

  await assertFails(deleteDoc(readingRef));
});

// ============================================
// OWNER ACCESS
// ============================================

test('should allow users to read their own reading sessions', async () => {
  await seedDocument(
    'users/user-a/books/book-1',
    validBookData(),
  );

  await seedDocument(
    'users/user-a/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 0,
      toPage: 10,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const db = authedDb('user-a');
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );

  await assertSucceeds(getDoc(readingRef));
});

test('should allow users to create reading sessions for their own books', async () => {
  const db = authedDb('user-a');
  const bookRef = doc(
    db,
    'users/user-a/books/book-1',
  );

  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );

  await seedDocument(
    'users/user-a/books/book-1',
    validBookData(),
  );

  const reading = {
    date: today(),
    fromPage: 0,
    toPage: 20,
    pages: 20,
    previousId: null,
    voided: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const updatedBook = {
    ...validBookData(),
    currentPage: 20,
    lastReadingId: 'reading-1',
    lastReadingDate: today(),
    updatedAt: Timestamp.now(),
  };

  const batch = writeBatch(db);

  batch.update(bookRef, {
    currentPage: updatedBook.currentPage,
    lastReadingId: updatedBook.lastReadingId,
    lastReadingDate: updatedBook.lastReadingDate,
    updatedAt: updatedBook.updatedAt,
  });

  batch.set(readingRef, reading);

  await assertSucceeds(batch.commit());
});

test('should allow users to update their own reading sessions', async () => {
  const db = authedDb('user-a');
  const bookRef = doc(
    db,
    'users/user-a/books/book-1',
  );
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );
  const book = validBookData();

  book.currentPage = 20;
  book.lastReadingId = 'reading-1';
  book.lastReadingDate = today();

  await seedDocument(
    'users/user-a/books/book-1',
    book,
  );

  await seedDocument(
    'users/user-a/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 10,
      toPage: 20,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const updatedReading = {
    date: today(),
    fromPage: 10,
    toPage: 30,
    pages: 20,
    previousId: null,
    voided: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const batch = writeBatch(db);

  batch.update(bookRef, {
    currentPage: 30,
    updatedAt: Timestamp.now(),
  });

  batch.update(readingRef, updatedReading);

  await assertSucceeds(batch.commit());
});

test('should allow users to delete their own reading sessions', async () => {
  const db = authedDb('user-a');
  const bookRef = doc(
    db,
    'users/user-a/books/book-1',
  );
  const readingRef = doc(
    db,
    'users/user-a/books/book-1/readings/reading-1',
  );
  const book = validBookData();

  book.currentPage = 20;
  book.lastReadingId = 'reading-1';
  book.lastReadingDate = today();

  await seedDocument(
    'users/user-a/books/book-1',
    book,
  );

  await seedDocument(
    'users/user-a/books/book-1/readings/reading-1',
    {
      date: today(),
      fromPage: 10,
      toPage: 20,
      pages: 10,
      previousId: null,
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  );

  const batch = writeBatch(db);

  batch.update(bookRef, {
    currentPage: 10,
    lastReadingId: null,
    lastReadingDate: null,
    updatedAt: Timestamp.now(),
  });

  batch.delete(readingRef);

  await assertSucceeds(batch.commit());
});
