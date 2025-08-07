import { z } from 'zod';
import { Role, WorkSpace, AttendanceType, LeavePeriod, AttendanceStatus } from '../types/models';

// Common schemas
export const idSchema = z.number().int().positive();
export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100)
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

// Report schemas
export const reportUserIdsSchema = z.object({
  ids: z.array(z.number().int().positive())
});

export const createReportSchema = z.array(z.object({
  user_id: z.number().int().positive(),
  content: z.string(),
  status: z.enum(['pending', 'success', 'failure']),
  project_id: z.number().int().positive()
}));

export const updateReportSchema = z.object({
  content: z.string().optional(),
  status: z.enum(['pending', 'success', 'failure']).optional(),
  project_id: z.number().int().positive().optional()
});

// Attendance schemas
export const createAttendanceSchema = z.object({
  type: z.enum(['working', 'leave']),
  workspace: z.enum(['office', 'home']).optional(),
  project: z.string(),
  leave_period: z.enum(['full', 'morning', 'evening']).optional(),
  leave_reason: z.string().optional(),
  late_minute: z.number().int().min(0).optional(),
  reported_by: z.number().int().positive(),
  status: z.enum(['pending', 'reported', 'failed']),
  created_by: z.number().int().positive()
});

// Adaptive Card Message schemas
export const adaptiveCardMessageTypeSchema = z.object({
  type: z.enum(['attendance', 'report'])
});

export const createAdaptiveCardMessageSchema = z.object({
  card_message: z.string(),
  user_id: z.number().int().positive(),
  type: z.enum(['attendance', 'report'])
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['rootadmin', 'manager', 'bse', 'leader', 'subleader', 'member'] as const),
  workflows_url: z.string().url().optional(),
  can_report: z.boolean(),
  supervisor_id: z.number().int().positive().optional(),
  project_id: z.number().int().positive()
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional(),
  is_active: z.boolean().optional()
});

// Attendance schemas
export const createAttendanceSchema = z.object({
  type: z.enum(['working', 'leave'] as const),
  workspace: z.enum(['office', 'home'] as const).optional(),
  project: z.string(),
  leave_period: z.enum(['full', 'morning', 'evening'] as const).optional(),
  leave_reason: z.string().optional(),
  late_minute: z.number().int().min(0).optional()
});

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(2),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

export const updateProjectSchema = createProjectSchema.partial();