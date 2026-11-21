import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { setupRulesTest, authedDb, unauthedDb, seedDocument, validUserData, validBookData, today, Timestamp } from './helpers';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';

setupRulesTest();

test('should deny unauthenticated access to user data', async () => {

  await seedDocument('users/user-a', validUserData());



  const db = unauthedDb();

  const userRef = doc(db, 'users/user-a');



  await assertFails(getDoc(userRef));

});

test('should deny users access to another users profile', async () => {

  await seedDocument('users/user-a', validUserData());



  const db = authedDb('user-b');

  const userRef = doc(db, 'users/user-a');



  await assertFails(getDoc(userRef));

});

test('should allow users to create their own profile', async () => {

  const db = authedDb('user-a');

  const userRef = doc(db, 'users/user-a');



  await assertSucceeds(setDoc(userRef, validUserData()));

});

test('should reject extra fields in user profiles', async () => {

  const db = authedDb('user-a');

  const userRef = doc(db, 'users/user-a');



  const user = {

    ...validUserData(),

    campoExtra: 'não permitido',

  };



  await assertFails(setDoc(userRef, user));

});

test('should reject AI consent enabled without a timestamp', async () => {

  const db = authedDb('user-a');

  const userRef = doc(db, 'users/user-a');



  const user = {

    ...validUserData(),

    aiPreferences: {

      allowReviewAnalysis: true,

      allowReviewAnalysisAt: null,

    },

  };



  await assertFails(setDoc(userRef, user));

});

test('should reject AI consent disabled with a timestamp', async () => {

  const db = authedDb('user-a');

  const userRef = doc(db, 'users/user-a');



  const user = {

    ...validUserData(),

    aiPreferences: {

      allowReviewAnalysis: false,

      allowReviewAnalysisAt: Timestamp.now(),

    },

  };



  await assertFails(setDoc(userRef, user));

});

test('should deny unauthenticated access to books', async () => {

  const db = unauthedDb();



  await seedDocument(

    'users/user-a/books/book-1',

    validBookData()

  );



  const bookRef = doc(db, 'users/user-a/books/book-1');



  await assertFails(getDoc(bookRef));

});

test('should deny users from reading another users books', async () => {

  const db = authedDb('user-a');



  await seedDocument(

    'users/user-b/books/book-1',

    validBookData()

  );



  const bookRef = doc(db, 'users/user-b/books/book-1');



  await assertFails(getDoc(bookRef));

});

test('should deny users from updating another users books', async () => {

  const db = authedDb('user-a');



  await seedDocument(

    'users/user-b/books/book-1',

    validBookData()

  );



  const bookRef = doc(db, 'users/user-b/books/book-1');



  await assertFails(

    updateDoc(bookRef, {

      title: 'Livro alterado indevidamente',

      updatedAt: Timestamp.now(),

    })

  );

});
