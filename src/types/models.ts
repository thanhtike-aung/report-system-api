import { WithTimestamps } from './common';

export type Role = 'rootadmin' | 'manager' | 'bse' | 'leader' | 'subleader' | 'member';

export type WorkSpace = 'office' | 'home';

export type AttendanceType = 'working' | 'leave';

export type LeavePeriod = 'full' | 'morning' | 'evening';

export type AttendanceStatus = 'pending' | 'reported' | 'failed';

export interface User extends WithTimestamps {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  is_active: boolean;
  workflows_url?: string;
  can_report: boolean;
  supervisor_id?: number;
  project_id: number;
  supervisor?: User;
  subordinates?: User[];
  attendance_reported?: Attendance[];
  attendance_created?: Attendance[];
  reports?: Report[];
  project?: Project;
  adaptive_cards?: AdaptiveCardMessage[];
}

export interface Attendance extends WithTimestamps {
  id: number;
  type: AttendanceType;
  workspace?: WorkSpace;
  project: string;
  leave_period?: LeavePeriod;
  leave_reason?: string;
  late_minute?: number;
  reported_by: number;
  status: AttendanceStatus;
  created_by: number;
  reporter?: User;
  creator?: User;
}

export interface Project extends WithTimestamps {
  id: number;
  name: string;
  color: string;
  users?: User[];
}

export interface Report extends WithTimestamps {
  id: number;
  // Add other report fields based on your schema
}

export interface AdaptiveCardMessage extends WithTimestamps {
  id: number;
  // Add other adaptive card message fields based on your schema
}