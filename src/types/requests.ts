import { Role, WorkSpace, AttendanceType, LeavePeriod } from './models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  workflows_url?: string;
  can_report: boolean;
  supervisor_id?: number;
  project_id: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  workflows_url?: string;
  can_report?: boolean;
  supervisor_id?: number;
  project_id?: number;
  is_active?: boolean;
}

export interface CreateAttendanceRequest {
  type: AttendanceType;
  workspace?: WorkSpace;
  project: string;
  leave_period?: LeavePeriod;
  leave_reason?: string;
  late_minute?: number;
}

export interface CreateProjectRequest {
  name: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  color?: string;
}