import { PrismaClient } from '@prisma/client';
import { UserService } from '../../../services/user/userService';
import { NotFoundError } from '../../../utils/errors/AppError';

// Mock PrismaClient
jest.mock('@prisma/client');

describe('UserService', () => {
  let userService: UserService;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    userService = new UserService();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'member',
        is_active: true,
        project_id: 1
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.findById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create and return new user', async () => {
      const mockUser = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'member',
        project_id: 1
      };

      prisma.user.create.mockResolvedValue({
        ...mockUser,
        id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      const result = await userService.create(mockUser);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });
  });

  // Add more test cases
});