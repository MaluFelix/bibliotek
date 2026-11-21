import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { setupRulesTest, authedDb, unauthedDb, seedDocument, validUserData, validBookData, today, Timestamp } from './helpers';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';

setupRulesTest();

test('should allow a valid book', async () => {

  const db = authedDb('user-a');

  const bookRef = doc(db, 'users/user-a/books/book-1');



  await assertSucceeds(setDoc(bookRef, validBookData()));

});

test('should allow a rating of 4.5', async () => {

  const db = authedDb('user-a');

  const bookRef = doc(db, 'users/user-a/books/book-1');



  const book = {

    ...validBookData(),

    rating: 4.5,

  };



  await assertSucceeds(setDoc(bookRef, book));

});

test('should reject a rating of 4.3', async () => {

  const db = authedDb('user-a');

  const bookRef = doc(db, 'users/user-a/books/book-1');



  const book = {

    ...validBookData(),

    rating: 4.3,

  };



  await assertFails(setDoc(bookRef, book));

});

test('should reject currentPage greater than pageCount', async () => {

  const db = authedDb('user-a');

  const bookRef = doc(db, 'users/user-a/books/book-1');



  const book = {

    ...validBookData(),

    pageCount: 300,

    currentPage: 301,

  };



  await assertFails(setDoc(bookRef, book));

});

test('should reject an empty book title', async () => {

  const db = authedDb('user-a');

  const bookRef = doc(db, 'users/user-a/books/book-1');



  const book = {

    ...validBookData(),

    title: '',

  };



  await assertFails(setDoc(bookRef, book));

});

test('should reject a rating greater than 5', async () => {

  const db = authedDb('user-a');



  await seedDocument(

    'users/user-a/books/book-1',

    validBookData()

  );



  const bookRef = doc(db, 'users/user-a/books/book-1');



  await assertFails(

    updateDoc(bookRef, {

      rating: 6,

      updatedAt: Timestamp.now(),

    })

  );

});

test('should reject ratings outside half-point increments', async () => {

  const db = authedDb('user-a');



  await seedDocument(

    'users/user-a/books/book-1',

    validBookData()

  );



  const bookRef = doc(db, 'users/user-a/books/book-1');



  await assertFails(

    updateDoc(bookRef, {

      rating: 3.3,

      updatedAt: Timestamp.now(),

    })

  );

});

test('should reject an empty book title on update', async () => {

  const db = authedDb('user-a');

  const path = 'users/user-a/books/book-1';



  await seedDocument(path, validBookData());



  await assertFails(

    updateDoc(doc(db, path), {

      title: '',

      updatedAt: Timestamp.now(),

    })

  );

});

test('should reject an invalid book status', async () => {

  const db = authedDb('user-a');

  const path = 'users/user-a/books/book-1';



  await seedDocument(path, validBookData());



  await assertFails(

    updateDoc(doc(db, path), {

      status: 'abandoned',

      updatedAt: Timestamp.now(),

    })

  );

});

test('should reject a negative currentPage', async () => {

  const db = authedDb('user-a');

  const path = 'users/user-a/books/book-1';



  await seedDocument(path, validBookData());



  await assertFails(

    updateDoc(doc(db, path), {

      currentPage: -1,

      updatedAt: Timestamp.now(),

    })

  );

});

test('should reject a pageCount of zero', async () => {

  const db = authedDb('user-a');

  const path = 'users/user-a/books/book-1';



  await seedDocument(path, validBookData());



  await assertFails(

    updateDoc(doc(db, path), {

      pageCount: 0,

      updatedAt: Timestamp.now(),

    })

  );

});

test('should reject unexpected book fields', async () => {

  const db = authedDb('user-a');

  const path = 'users/user-a/books/book-1';



  await seedDocument(path, validBookData());



  await assertFails(

    updateDoc(doc(db, path), {

      isAdmin: true,

      updatedAt: Timestamp.now(),

    })

  );

});
