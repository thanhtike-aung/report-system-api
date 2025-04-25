import { minutesDifferFrom } from "../../utils/dayjs";
import {
  ATTENDANCE_STATUS,
  LEAVE_REASON,
  TYPE,
  WORKING_TIME,
} from "../../constants/attendance";
import prisma from "../../lib/prisma";
import {
  Attendance,
  AttendanceType,
  CreateAttendancePayload,
  LeavePeriod,
  WorkingTime,
} from "../../types/attendance";
import { AttendanceStatus } from "@prisma/client";

/**
 * Determine the leave period based on working time and leave period.
 * helper func
 * @param workingTime
 * @param leavePeriod
 * @returns
 */
const determineLeavePeriod = (
  workingTime: WorkingTime | null,
  leavePeriod: LeavePeriod | null,
): LeavePeriod => {
  if (workingTime === WORKING_TIME.MORNING) return "evening";
  if (workingTime === WORKING_TIME.EVENING) return "morning";
  if (workingTime === null && leavePeriod !== null) return leavePeriod;
  return "full";
};

/**
 * Determine the leave reason based on leave reason and other leave reason.
 * helper func
 * @param leaveReason
 * @param otherLeaveReason
 * @returns
 */
const determineLeaveReason = (
  leaveReason: string | null,
  otherLeaveReason: string | null,
): string | null => {
  return leaveReason !== LEAVE_REASON.OTHER ? leaveReason : otherLeaveReason;
};

/**
 * Get all attendance.
 * @returns
 */
export const get = async (): Promise<Array<Attendance>> => {
  return prisma.attendance.findMany({
    include: { reporter: true, creator: true },
  });
};

/**
 * Save attendance
 * @param attendance
 * @returns
 */
export const create = async (
  attendance: CreateAttendancePayload,
): Promise<Attendance> => {
  const modifiedLeavePeriod = determineLeavePeriod(
    attendance.workingTime,
    attendance.leavePeriod,
  );
  const leaveReason = determineLeaveReason(
    attendance.leaveReason,
    attendance.otherLeaveReason,
  );
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  const exisitingAttendance = await prisma.attendance.findFirst({
    where: {
      reported_by: attendance.reportedBy,
      created_at: {
        gte: todayStart,
        lt: todayEnd,
      },
      status: ATTENDANCE_STATUS.PENDING as AttendanceStatus,
    },
  });

  const attendanceData = {
    type:
      attendance.workingTime === WORKING_TIME.FULL
        ? (TYPE.WORKING as AttendanceType)
        : (TYPE.LEAVE as AttendanceType),
    workspace: attendance.workspace,
    project: attendance.project,
    leave_period:
      attendance.workingTime === WORKING_TIME.FULL
        ? attendance.leavePeriod
        : modifiedLeavePeriod,
    leave_reason: leaveReason,
    late_minute:
      attendance.lateMinute !== null
        ? minutesDifferFrom(attendance.lateMinute, 8)
        : 0,
    reported_by: attendance.reportedBy,
    created_by: attendance.createdBy,
    status: ATTENDANCE_STATUS.PENDING as AttendanceStatus,
  };

  /* NOTE: can't use upsert because there is no "id" to provided in where */
  if (exisitingAttendance) {
    return prisma.attendance.update({
      where: { id: exisitingAttendance.id },
      data: attendanceData,
    });
  } else {
    return prisma.attendance.create({
      data: attendanceData,
    });
  }
};

/**
 * get today attendances
 * @param
 * @returns
 */
export const getByToday = async (): Promise<Attendance[]> => {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  return await prisma.attendance.findMany({
    where: {
      updated_at: {
        gte: todayStart,
        lt: todayEnd,
      },
      status: ATTENDANCE_STATUS.PENDING as AttendanceStatus,
    },
    include: {
      reporter: {
        include: { project: true },
      },
    },
  });
};
