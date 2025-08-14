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
import { AdaptiveCardMessageType, AttendanceStatus } from "@prisma/client";
import { BaseService } from "../common/baseService";
import { logger } from "../../utils/logger";
import { ValidationError } from "../../utils/errors";
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

class AttendanceService extends BaseService {
  constructor() {
    super(prisma);
  }

  /**
   * Get all attendance records
   */
  async getAllAttendances(): Promise<Attendance[]> {
    return this.execute(async () => {
      return await this.prisma.attendance.findMany({
        include: { reporter: true, creator: true },
        orderBy: { updated_at: 'desc' },
      });
    }, 'getAllAttendances');
  }

  /**
   * Get attendance by user ID
   */
  async getAttendanceByUserId(userId: number): Promise<Attendance | null> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      
      return await this.prisma.attendance.findFirst({
        where: { reported_by: validUserId },
        include: { reporter: true, creator: true },
      });
    }, 'getAttendanceByUserId');
  }

  /**
   * Get attendance by user ID and specific date
   */
  async getAttendanceByIdAndDate(userId: number, date: string): Promise<Attendance | null> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      const { startDate, endDate } = this.getDateRange(date);
      
      return await this.prisma.attendance.findFirst({
        where: {
          reported_by: validUserId,
          updated_at: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: { reporter: true, creator: true },
      });
    }, 'getAttendanceByIdAndDate');
  }

  /**
   * Get today's attendance records
   */
  async getTodayAttendances(): Promise<Attendance[]> {
    return this.execute(async () => {
      const { startDate, endDate } = this.getTodayRange();
      
      return await this.prisma.attendance.findMany({
        where: {
          updated_at: {
            gte: startDate,
            lt: endDate,
          },
          status: ATTENDANCE_STATUS.PENDING as AttendanceStatus,
        },
        include: {
          reporter: {
            include: { project: true },
          },
        },
        orderBy: { updated_at: 'desc' },
      });
    }, 'getTodayAttendances');
  };

  /**
   * Create attendance record
   */
  async createAttendance(attendance: CreateAttendancePayload): Promise<Attendance | undefined> {
    return this.executeWithTransaction(async (tx) => {
      // Validate input
      if (!attendance.reportedBy || !attendance.createdBy) {
        throw new ValidationError('Reporter and creator IDs are required');
      }

      const validReportedBy = this.validateId(attendance.reportedBy, 'Reported By ID');
      const validCreatedBy = this.validateId(attendance.createdBy, 'Created By ID');

      logger.info('Creating attendance record', { 
        reportedBy: validReportedBy, 
        createdBy: validCreatedBy,
        workingTime: attendance.workingTime 
      });
      const modifiedLeavePeriod = determineLeavePeriod(
        attendance.workingTime,
        attendance.leavePeriod,
      );
      const leaveReason = determineLeaveReason(
        attendance.leaveReason,
        attendance.otherLeaveReason,
      );
      
      const { startDate: todayStart, endDate: todayEnd } = this.getTodayRange();

      const existingAttendance = await tx.attendance.findFirst({
        where: {
          reported_by: validReportedBy,
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
        reported_by: validReportedBy,
        created_by: validCreatedBy,
        status: ATTENDANCE_STATUS.PENDING as AttendanceStatus,
      };

      // Handle existing attendance update
      if (existingAttendance) {
        logger.info('Updating existing attendance', { attendanceId: existingAttendance.id });
        
        // for evening reporting
        if (attendanceData.leave_period !== LEAVE_PERIOD.FULL) {
          await tx.report.deleteMany({
            where: {
              user_id: validReportedBy,
              updated_at: {
                gte: todayStart,
                lt: todayEnd,
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
              user_id: validReportedBy,
            },
          });
        }
        
        const updatedAttendance = await tx.attendance.update({
          where: { id: existingAttendance.id },
          data: attendanceData,
          include: { reporter: true, creator: true },
        });
        
        logger.info('Attendance updated successfully', { attendanceId: updatedAttendance.id });
        return updatedAttendance;
      } else {
        logger.info('Creating new attendance record');
        
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
              user_id: validReportedBy,
            },
          });
        }
        
        const newAttendance = await tx.attendance.create({
          data: attendanceData,
          include: { reporter: true, creator: true },
        });
        
        logger.info('Attendance created successfully', { attendanceId: newAttendance.id });
        return newAttendance;
      }
    }, 'createAttendance');
  }

  /**
   * Save adaptive card message for attendance
   */
  async saveAdaptiveCardMessage(messagePayload: any, userId: number): Promise<void> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      
      if (!messagePayload) {
        throw new ValidationError('Message payload cannot be null or undefined');
      }

      await this.prisma.adaptiveCardMessage.create({
        data: {
          card_message: JSON.stringify(messagePayload),
          type: AdaptiveCardMessageType.attendance,
          user_id: validUserId,
        },
      });

      logger.info('Adaptive card message saved for attendance', { userId: validUserId });
    }, 'saveAdaptiveCardMessage');
  }
}

const attendanceService = new AttendanceService();

// Legacy exports for backward compatibility
export const get = () => attendanceService.getAllAttendances();
export const getById = (id: number) => attendanceService.getAttendanceByUserId(id);
export const getByIdAndDate = (id: number, date: string) => attendanceService.getAttendanceByIdAndDate(id, date);
export const getByToday = () => attendanceService.getTodayAttendances();
export const create = (attendance: CreateAttendancePayload) => attendanceService.createAttendance(attendance);
export const saveAdaptiveCardMessage = (payload: any, userId: number) => attendanceService.saveAdaptiveCardMessage(payload, userId);


