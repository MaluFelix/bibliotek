import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { setupRulesTest, authedDb, unauthedDb, seedDocument, validUserData, validBookData, today, Timestamp } from './helpers';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';

setupRulesTest();

test('should allow a valid reading batch', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const logRef = doc(

    db,

    `users/user-a/readingLogs/${today()}`

  );



  // Estado anterior do livro: página 186.

  const initialBook = {

    ...validBookData(),

    currentPage: 186,

    lastReadingId: null,

    lastReadingDate: null,

  };



  // O livro precisa existir antes de registrar uma sessão.

  await assertSucceeds(setDoc(bookRef, initialBook));



  const reading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  const log = {

    date: today(),

    books: {

      'book-1': 20,

    },

    totalPages: 20,

    updatedAt: Timestamp.now(),

  };



  const batch = writeBatch(db);



  // Atualiza o progresso do livro.

  batch.update(bookRef, {

    currentPage: 206,

    lastReadingId: 'reading-1',

    lastReadingDate: today(),

    updatedAt: Timestamp.now(),

  });



  // Cria a sessão de leitura.

  batch.set(readingRef, reading);



  // Atualiza o resumo diário.

  batch.set(logRef, log);



  await assertSucceeds(batch.commit());

});

test('should reject a reading with inconsistent page counts', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const logRef = doc(

    db,

    `users/user-a/readingLogs/${today()}`

  );



  // Livro já existente, com progresso inicial na página 186.

  const initialBook = {

    ...validBookData(),

    currentPage: 186,

    lastReadingId: null,

    lastReadingDate: null,

  };



  await assertSucceeds(setDoc(bookRef, initialBook));



  const reading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 19, // Inválido: 206 - 186 = 20.

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  const log = {

    date: today(),

    books: {

      'book-1': 20,

    },

    totalPages: 20,

    updatedAt: Timestamp.now(),

  };



  const batch = writeBatch(db);



  batch.update(bookRef, {

    currentPage: 206,

    lastReadingId: 'reading-1',

    lastReadingDate: today(),

    updatedAt: Timestamp.now(),

  });



  batch.set(readingRef, reading);

  batch.set(logRef, log);



  await assertFails(batch.commit());

});

test('should reject a reading dated in the future', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-future'

  );



  const futureDate = new Date();

  futureDate.setDate(futureDate.getDate() + 2);

  const futureDateString = futureDate.toISOString().slice(0, 10);



  const initialBook = {

    ...validBookData(),

    currentPage: 186,

    lastReadingId: null,

    lastReadingDate: null,

  };



  await assertSucceeds(setDoc(bookRef, initialBook));



  const reading = {

    date: futureDateString,

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  const logRef = doc(

    db,

    `users/user-a/readingLogs/${futureDateString}`

  );



  const log = {

    date: futureDateString,

    books: {

      'book-1': 20,

    },

    totalPages: 20,

    updatedAt: Timestamp.now(),

  };



  const batch = writeBatch(db);



  batch.update(bookRef, {

    currentPage: 206,

    lastReadingId: 'reading-future',

    lastReadingDate: futureDateString,

    updatedAt: Timestamp.now(),

  });



  batch.set(readingRef, reading);

  batch.set(logRef, log);



  await assertFails(batch.commit());

});

test('should allow editing the latest reading session', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');

  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 206,

    lastReadingId: 'reading-1',

    lastReadingDate: today(),

  };



  const initialReading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument('users/user-a/books/book-1', initialBook);

  await seedDocument(

  'users/user-a/books/book-1/readings/reading-1',

  initialReading

  );



  const updatedReading = {

    ...initialReading,

    toPage: 220,

    pages: 34,

    updatedAt: Timestamp.now(),

  };



  const batch = writeBatch(db);



  batch.update(bookRef, {

    currentPage: 220,

    updatedAt: Timestamp.now(),

  });



  batch.update(readingRef, updatedReading);



  await assertSucceeds(batch.commit());

});

test('should allow deleting the latest reading and revert book progress', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');

  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 206,

    lastReadingId: 'reading-1',

    lastReadingDate: today(),

  };



  const initialReading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    initialReading

  );



  const batch = writeBatch(db);



  batch.update(bookRef, {

    currentPage: 186,

    lastReadingId: null,

    lastReadingDate: null,

    updatedAt: Timestamp.now(),

  });



  batch.delete(readingRef);



  await assertSucceeds(batch.commit());



  const deletedReading = await getDoc(readingRef);

  const updatedBook = await getDoc(bookRef);



  assert.equal(deletedReading.exists(), false);

  assert.equal(updatedBook.data().currentPage, 186);

  assert.equal(updatedBook.data().lastReadingId, null);

  assert.equal(updatedBook.data().lastReadingDate, null);

});

test('should deny deleting a non-latest reading session', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');

  const reading1Ref = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );

  const reading2Ref = doc(

    db,

    'users/user-a/books/book-1/readings/reading-2'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 220,

    lastReadingId: 'reading-2',

    lastReadingDate: today(),

  };



  const reading1 = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  const reading2 = {

    date: today(),

    fromPage: 206,

    toPage: 220,

    pages: 14,

    previousId: 'reading-1',

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    reading1

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-2',

    reading2

  );



  await assertFails(

    deleteDoc(reading1Ref)

  );



  const oldReading = await getDoc(reading1Ref);

  const book = await getDoc(bookRef);



  assert.equal(oldReading.exists(), true);

  assert.equal(book.data().currentPage, 220);

  assert.equal(book.data().lastReadingId, 'reading-2');

});

test('should allow voiding an older reading without changing book progress', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');



  const reading1Ref = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const reading2Ref = doc(

    db,

    'users/user-a/books/book-1/readings/reading-2'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 220,

    lastReadingId: 'reading-2',

    lastReadingDate: today(),

  };



  const reading1 = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  const reading2 = {

    date: today(),

    fromPage: 206,

    toPage: 220,

    pages: 14,

    previousId: 'reading-1',

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    reading1

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-2',

    reading2

  );



  await assertSucceeds(

    updateDoc(reading1Ref, {

      voided: true,

      updatedAt: Timestamp.now(),

    })

  );



  const voidedReading = await getDoc(reading1Ref);

  const book = await getDoc(bookRef);

  const latestReading = await getDoc(reading2Ref);



  assert.equal(voidedReading.exists(), true);

  assert.equal(voidedReading.data().voided, true);



  assert.equal(latestReading.exists(), true);

  assert.equal(latestReading.data().voided, false);



  assert.equal(book.data().currentPage, 220);

  assert.equal(book.data().lastReadingId, 'reading-2');

});

test('should deny voiding the latest reading session', async () => {

  const db = authedDb('user-a');



  const bookRef = doc(db, 'users/user-a/books/book-1');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 206,

    lastReadingId: 'reading-1',

    lastReadingDate: today(),

  };



  const reading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: false,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    reading

  );



  await assertFails(

    updateDoc(readingRef, {

      voided: true,

      updatedAt: Timestamp.now(),

    })

  );



  const savedReading = await getDoc(readingRef);

  const savedBook = await getDoc(bookRef);



  assert.equal(savedReading.exists(), true);

  assert.equal(savedReading.data().voided, false);



  assert.equal(savedBook.data().currentPage, 206);

  assert.equal(savedBook.data().lastReadingId, 'reading-1');

});

test('should deny editing a voided reading session', async () => {

  const db = authedDb('user-a');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 220,

    lastReadingId: 'reading-2',

    lastReadingDate: today(),

  };



  const voidedReading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: true,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    voidedReading

  );



  await assertFails(

    updateDoc(readingRef, {

      date: today(),

      fromPage: 186,

      toPage: 210,

      pages: 24,

      previousId: null,

      voided: true,

      createdAt: voidedReading.createdAt,

      updatedAt: Timestamp.now(),

    })

  );



  const savedReading = await getDoc(readingRef);



  assert.equal(savedReading.exists(), true);

  assert.equal(savedReading.data().voided, true);

  assert.equal(savedReading.data().toPage, 206);

  assert.equal(savedReading.data().pages, 20);

});

test('should deny deleting a voided reading session', async () => {

  const db = authedDb('user-a');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 220,

    lastReadingId: 'reading-2',

    lastReadingDate: today(),

  };



  const voidedReading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: true,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    voidedReading

  );



  await assertFails(

    deleteDoc(readingRef)

  );



  const savedReading = await getDoc(readingRef);



  assert.equal(savedReading.exists(), true);

  assert.equal(savedReading.data().voided, true);

});

test('should deny voiding an already voided reading session', async () => {

  const db = authedDb('user-a');



  const readingRef = doc(

    db,

    'users/user-a/books/book-1/readings/reading-1'

  );



  const initialBook = {

    ...validBookData(),

    currentPage: 220,

    lastReadingId: 'reading-2',

    lastReadingDate: today(),

  };



  const voidedReading = {

    date: today(),

    fromPage: 186,

    toPage: 206,

    pages: 20,

    previousId: null,

    voided: true,

    createdAt: Timestamp.now(),

    updatedAt: Timestamp.now(),

  };



  await seedDocument(

    'users/user-a/books/book-1',

    initialBook

  );



  await seedDocument(

    'users/user-a/books/book-1/readings/reading-1',

    voidedReading

  );



  await assertFails(

    updateDoc(readingRef, {

      voided: true,

      updatedAt: Timestamp.now(),

    })

  );



  const savedReading = await getDoc(readingRef);



  assert.equal(savedReading.exists(), true);

  assert.equal(savedReading.data().voided, true);

});
