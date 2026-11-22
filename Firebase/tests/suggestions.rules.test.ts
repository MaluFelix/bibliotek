import { test } from 'node:test';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import {
  setupRulesTest,
  authedDb,
  unauthedDb,
  seedDocument,
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

function validSuggestionData() {
  return {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    coverUrl: null,
    externalId: null,
    basedOnBookId: 'book-123',
    reason: 'Recommended based on your reading history.',
    status: 'new',
    createdAt: Timestamp.now(),
  };
}

function suggestionPath(uid: string, suggestionId = 'suggestion-1') {
  return `users/${uid}/suggestions/${suggestionId}`;
}

// --------------------------------------------------
// READ
// --------------------------------------------------

test('should deny unauthenticated user from reading a suggestion', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    getDoc(doc(unauthedDb(), path)),
  );
});

test('should deny a user from reading another user suggestion', async () => {
  const path = suggestionPath('user-b');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    getDoc(doc(authedDb('user-a'), path)),
  );
});

test('should allow owner to read their suggestion', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertSucceeds(
    getDoc(doc(authedDb('user-a'), path)),
  );
});

// --------------------------------------------------
// CREATE
// --------------------------------------------------

test('should deny unauthenticated user from creating a suggestion', async () => {
  const path = suggestionPath('user-a');

  await assertFails(
    setDoc(
      doc(unauthedDb(), path),
      validSuggestionData(),
    ),
  );
});

test('should deny user from creating a suggestion for another user', async () => {
  const path = suggestionPath('user-b');

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      validSuggestionData(),
    ),
  );
});

test('should deny creating a suggestion with an empty title', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    title: '',
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should deny creating a suggestion with a title exceeding 300 characters', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    title: 'A'.repeat(301),
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should deny creating a suggestion with an empty basedOnBookId', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    basedOnBookId: '',
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should deny creating a suggestion with an invalid status', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    status: 'accepted',
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should deny creating a suggestion with a reason exceeding 500 characters', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    reason: 'A'.repeat(501),
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should deny creating a suggestion with an author exceeding 300 characters', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    author: 'A'.repeat(301),
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should deny creating a suggestion with an unknown field', async () => {
  const path = suggestionPath('user-a');
  const data = {
    ...validSuggestionData(),
    admin: true,
  };

  await assertFails(
    setDoc(
      doc(authedDb('user-a'), path),
      data,
    ),
  );
});

test('should allow owner to create a valid suggestion', async () => {
  const path = suggestionPath('user-a');

  await assertSucceeds(
    setDoc(
      doc(authedDb('user-a'), path),
      validSuggestionData(),
    ),
  );
});

// --------------------------------------------------
// UPDATE
// --------------------------------------------------

test('should deny unauthenticated user from updating a suggestion', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    updateDoc(
      doc(unauthedDb(), path),
      { status: 'wishlist' },
    ),
  );
});

test('should deny user from updating another user suggestion', async () => {
  const path = suggestionPath('user-b');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    updateDoc(
      doc(authedDb('user-a'), path),
      { status: 'wishlist' },
    ),
  );
});

test('should deny updating a suggestion with an invalid status', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    updateDoc(
      doc(authedDb('user-a'), path),
      { status: 'accepted' },
    ),
  );
});

test('should deny updating a suggestion with an empty title', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    updateDoc(
      doc(authedDb('user-a'), path),
      { title: '' },
    ),
  );
});

test('should deny updating a suggestion with an empty basedOnBookId', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    updateDoc(
      doc(authedDb('user-a'), path),
      { basedOnBookId: '' },
    ),
  );
});

test('should deny updating a suggestion with an unknown field', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    updateDoc(
      doc(authedDb('user-a'), path),
      { admin: true },
    ),
  );
});

test('should allow owner to update a suggestion with valid data', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertSucceeds(
    updateDoc(
      doc(authedDb('user-a'), path),
      { status: 'wishlist' },
    ),
  );
});

// --------------------------------------------------
// DELETE
// --------------------------------------------------

test('should deny unauthenticated user from deleting a suggestion', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    deleteDoc(doc(unauthedDb(), path)),
  );
});

test('should deny user from deleting another user suggestion', async () => {
  const path = suggestionPath('user-b');

  await seedDocument(path, validSuggestionData());

  await assertFails(
    deleteDoc(doc(authedDb('user-a'), path)),
  );
});

test('should allow owner to delete their suggestion', async () => {
  const path = suggestionPath('user-a');

  await seedDocument(path, validSuggestionData());

  await assertSucceeds(
    deleteDoc(doc(authedDb('user-a'), path)),
  );
});
