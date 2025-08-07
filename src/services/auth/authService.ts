import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../../utils/errors/AppError';
import { config } from '../../config';
import { LoginRequest } from '../../types/requests';
import { User } from '../../types/models';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(credentials: LoginRequest): Promise<{ user: Omit<User, 'password'>, token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!config.jwt.secret) {
      throw new Error('JWT secret is not defined');
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    const { password, workflows_url, supervisor_id, ...rest } = user;
    return { 
      user: { ...rest, workflows_url: workflows_url || undefined, supervisor_id: supervisor_id || undefined }, 
      token 
    };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }
}