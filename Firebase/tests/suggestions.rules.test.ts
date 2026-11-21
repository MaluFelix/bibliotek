import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { setupRulesTest, authedDb, unauthedDb, seedDocument, validUserData, validBookData, today, Timestamp } from './helpers';
import { doc, setDoc, updateDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';

setupRulesTest();

test('should reject an invalid suggestion status', async () => {

  const db = authedDb('user-a');



  const suggestionRef = doc(

    db,

    'users/user-a/suggestions/suggestion-1'

  );



  const suggestion = {

    title: 'Livro sugerido',

    author: 'Autor Teste',

    coverUrl: null,

    externalId: null,

    basedOnBookId: 'book-1',

    reason: 'Sugestão baseada na sua biblioteca.',

    status: 'invalid-status',

    createdAt: Timestamp.now(),

  };



  await assertFails(setDoc(suggestionRef, suggestion));

});
