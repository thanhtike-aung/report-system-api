import { User } from "types/user";

export interface Attendance {
  id: number;
  type: AttendanceType;
  workspace: WorkSpace | null;
  project: string;
  leave_period: LeavePeriod | null;
  leave_reason: LeaveReason | string | null;
  late_minute: number | null;
  reported_by: number;
  reporter?: User;
}

export interface CreateAttendancePayload {
  type: AttendanceType;
  workspace: WorkSpace | null;
  workingTime: WorkingTime | null;
  project: string;
  leavePeriod: LeavePeriod | null;
  leaveReason: LeaveReason | null;
  otherLeaveReason: string | null;
  isLate: boolean;
  lateMinute: string | null;
  reportedBy: number;
  createdBy: number;
}

export type AttendanceType = "working" | "leave";

export type WorkingTime = "full" | "morning" | "evening";

export type WorkSpace = "office" | "home";

export type LeavePeriod = "full" | "morning" | "evening";

export type LeaveReason = "sick" | "personal" | "other";
