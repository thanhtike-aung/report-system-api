import { Express } from 'express';
import { createApp } from '../../app';
import { testRequest, createTestToken } from '../utils';
import { PrismaClient } from '@prisma/client';

describe('Auth Routes', () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await createApp();
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid credentials', async () => {
      const response = await testRequest(app).post('/api/auth/login', {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    // Add more test cases
  });

  describe('Protected Routes', () => {
    it('should return 401 without token', async () => {
      const response = await testRequest(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 with insufficient permissions', async () => {
      const token = createTestToken(1, 'member');
      const response = await testRequest(app).post('/api/users', {}, token);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    // Add more test cases
  });
});