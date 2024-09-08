// jest.setup.js
// jest.setup.js
import '@testing-library/jest-native/extend-expect';
// Mock the `firebase/auth` module for Firebase v9+ modular API
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(),
      onAuthStateChanged: jest.fn(),
    })),
    signInWithEmailAndPassword: jest.fn(),
  }));
  
  // Mock the `firebase/app` module for Firebase v9+
  jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []), // Mock for checking initialized apps
    getApp: jest.fn(() => ({
      auth: jest.fn(),
      firestore: jest.fn(),
      storage: jest.fn(),
    })),
  }));
  