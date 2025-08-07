import { PrismaClient } from '@prisma/client';

// Mock PrismaClient for tests
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      // Add mock implementations as needed
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      },
      // Add other models as needed
      $connect: jest.fn(),
      $disconnect: jest.fn()
    }))
  };
});

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

// Global test teardown
afterAll(() => {
  // Add any global teardown here
});