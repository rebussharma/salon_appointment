// src/setupTests.ts
import '@testing-library/jest-dom';

// Suppress deprecation warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('punycode')) return;
  originalWarn(...args);
};

// Mock the window.fs API
const mockFs = {
  readFile: jest.fn(),
};

(window as any).fs = mockFs;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockFs.readFile.mockReset();
});

// Mock date
const mockDate = new Date('2025-02-14T11:55:00');
const OriginalDate = global.Date;
global.Date = jest.fn(() => mockDate) as any;
global.Date.now = jest.fn(() => mockDate.getTime());

// Restore original implementations
afterAll(() => {
  global.Date = OriginalDate;
  console.warn = originalWarn;
});

// Mock MUI's useMediaQuery hook
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false,
}));

// Add missing dom properties
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});