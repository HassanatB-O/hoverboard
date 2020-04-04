import * as firebase from '@firebase/testing';
import * as fs from 'fs';
import { setup, teardown } from 'jest-dev-server';

export const setupFirestore = async () => {
  await setup({
    command: 'npx firebase emulators:start --only firestore',
    launchTimeout: 30000,
    port: 8080,
    usedPortAction: 'error',
  });
};

export const teardownFirestore = async () => {
  await teardown();
};

const loadRules = async (projectId: string, path: string) => {
  await firebase.loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(path, 'utf8'),
  });
};

export const setupApp = async (auth?: object, data?: object) => {
  const projectId = `rules-spec-${Date.now()}`;
  const app = firebase.initializeTestApp({
    projectId,
    auth,
  });
  const db = app.firestore();

  if (data) {
    await loadRules(projectId, '__tests__/firestore.rules');

    for (const key in data) {
      if ({}.hasOwnProperty.call(data, key)) {
        await db.doc(key).set(data[key]);
      }
    }
  }

  await loadRules(projectId, 'firestore.rules');

  return db;
};

export const teardownApp = async () => {
  return Promise.all(firebase.apps().map((app) => app.delete()));
};