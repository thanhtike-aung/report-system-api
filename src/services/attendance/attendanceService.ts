import { minutesDifferFrom } from "../../utils/dayjs";
import {
  ATTENDANCE_STATUS,
  LEAVE_PERIOD,
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
import dayjs from "dayjs";

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
 * get a specific attendance
 * @param id
 * @returns
 */
export const getById = async (id: number): Promise<Attendance | null> => {
  return prisma.attendance.findFirst({
    where: { reported_by: id },
  });
};

/**
 * get specific attendance by id and desired date
 * @param id
 * @param date
 * @returns
 */
export const getByIdAndDate = async (
  id: number,
  date: string,
): Promise<Attendance | null> => {
  const startOfDay = dayjs(date).startOf("day").toDate();
  const endOfDay = dayjs(date).endOf("day").toDate();
  return prisma.attendance.findFirst({
    where: {
      reported_by: id,
      updated_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });
};

/**
 * Save attendance
 * @param attendance
 * @returns
 */
export const create = async (
  attendance: CreateAttendancePayload,
): Promise<Attendance | undefined> => {
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

  const existingAttendance = await prisma.attendance.findFirst({
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
  if (existingAttendance) {
    return prisma.$transaction(async (tx) => {
      // for evening reporting
      if (attendanceData.leave_period !== LEAVE_PERIOD.FULL) {
        await tx.report.deleteMany({
          where: {
            user_id: attendanceData.reported_by,
            updated_at: {
              gte: dayjs().startOf("day").toDate(),
              lt: dayjs().endOf("day").toDate(),
            },
          },
        });
      } else {
        await tx.report.create({
          data: {
            project: attendanceData.project,
            task_title: "",
            task_description: "",
            progress: 0,
            man_hours: 0,
            working_time: 0,
            user_id: attendanceData.reported_by,
          },
        });
      }
      return prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: attendanceData,
      });
    });
  } else {
    return prisma.$transaction(async (tx) => {
      // for evening reporting
      if (attendanceData.leave_period === LEAVE_PERIOD.FULL) {
        await tx.report.create({
          data: {
            project: attendanceData.project,
            task_title: "",
            task_description: "",
            progress: 0,
            man_hours: 0,
            working_time: 0,
            user_id: attendanceData.reported_by,
          },
        });
      }
      return tx.attendance.create({
        data: attendanceData,
      });
    });
  }
};

/**
 * get today attendances
 * @param
 * @returns
 */
export const getByToday = async (): Promise<Attendance[]> => {
  return await prisma.attendance.findMany({
    where: {
      updated_at: {
        gte: dayjs().startOf("day").toDate(),
        lt: dayjs().endOf("day").toDate(),
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
