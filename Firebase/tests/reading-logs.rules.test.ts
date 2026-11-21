import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { setupRulesTest, authedDb, unauthedDb, seedDocument, validUserData, validBookData, today, Timestamp } from './helpers';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';

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
