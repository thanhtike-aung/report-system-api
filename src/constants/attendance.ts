import { LeavePeriod } from "types/attendance";

export const TYPE = {
  WORKING: "working",
  LEAVE: "leave",
};

export const WORKING_TIME = {
  FULL: "full",
  MORNING: "morning",
  EVENING: "evening",
};

export const WORKSPACE = {
  OFFICE: "office",
  HOME: "home",
};

export const LEAVE_PERIOD = {
  FULL: "full",
  MORNING: "morning",
  EVENING: "evening",
};

export const LEAVE_REASON = {
  SICK: "sick",
  PERSONAL: "personal",
  OTHER: "other",
};

export const ATTENDANCE_STATUS = {
  PENDING: "pending",
  REPORTED: "reported",
  FAILED: "failed",
};
