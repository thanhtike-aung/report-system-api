import { NextFunction, Request, Response } from "express";
import { BaseController } from "../common/baseController";
import { validateInput } from "../../utils/validation";
import {
  create as createAttendanceService,
  get as getAttendanceService,
  getById as getAttendanceByIdService,
  getByToday as getTodayAttendanceService,
  getByIdAndDate as getAttendanceByIdAndDateService,
} from "../../services/attendance/attendanceService";
import { NotFoundError } from "../../utils/errors";
import {
  getActiveUsers,
} from "../../services/user/userService";
import {
  sendAttendanceReminderToTeams,
  sendAttendanceToTeams as sendAttendanceToTeamsUtils,
} from "../../utils/attendance/sendToTeams";
import { Attendance } from "types/attendance";
import { STATUS_CODES } from "../../constants/messages";
import { logger } from "../../utils/logger";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 15 * 60 * 1000;

class AttendanceController extends BaseController {
  /**
   * Get all attendances
   */
  public getAttendances = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getAttendanceService();
      },
      "Attendances retrieved successfully"
    );
  };

  /**
   * Get attendance by user ID
   */
  public getAttendanceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const id = this.getIdFromParams(req);
        return await getAttendanceByIdService(id);
      },
      "Attendance retrieved successfully"
    );
  };

  /**
   * Get attendance by user ID and date
   */
  public getAttendanceByIdAndDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const id = this.getIdFromParams(req);
        const date = req.params.date;
        
        if (!date) {
          throw new Error("Date parameter is required");
        }
        
        const test =  await getAttendanceByIdAndDateService(id, date);
        console.log("--------------------------------");
        console.log(test);
        console.log("--------------------------------");
        return test;
      },
      "Attendance retrieved successfully"
    );
  };

  /**
   * Create attendance
   */
  public createAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        validateInput(req.body, [
          { field: 'reportedBy', required: true, type: 'number' },
          { field: 'createdBy', required: true, type: 'number' },
          { field: 'workingTime', required: true, type: 'string' },
          { field: 'workspace', required: true, type: 'string' },
          { field: 'project', required: true, type: 'string' }
        ]);

        return await createAttendanceService(req.body);
      },
      "Attendance created successfully",
      STATUS_CODES.CREATED
    );
  };

  /**
   * Get today's attendances
   */
  public getAttendanceByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const attendance = await getTodayAttendanceService();
        if (!attendance || attendance.length === 0) {
          throw new NotFoundError("No attendance records found for today");
        }
        return attendance;
      },
      "Today's attendance retrieved successfully"
    );
  };
}

/**
 * get users who didn't report
 * @param users
 * @param reports
 * @returns
 */
const getNotReportedUsers = (users: any[], attendances: any[]) => {
  const reportedUserIds = attendances.map(
    (attendance) => attendance.reporter?.id,
  );
  return users.filter((user) => !reportedUserIds.includes(user.id));
};

/**
 * retry mechanism
 * @param retryCount
 */
const handleRetryDelay = async (retryCount: number) => {
  if (retryCount < MAX_RETRIES) {
    console.log("Retrying...");
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  } else {
    console.error("Maximum retry limit reached!");
  }
};

/**
 * send attendance to microsoft teams channel
 */
/**
 * Send attendance to Teams (for cron job)
 */
export const sendAttendanceToTeams = async (): Promise<void> => {
  let retryCount = 0;
  let isSuccess = false;

  while (retryCount <= MAX_RETRIES && !isSuccess) {
    try {
      logger.info(`Attempting attendance Teams notification (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

      const users = await getActiveUsers();
      const attendances = await getTodayAttendanceService();
      const sortedAttendances = attendances.sort(
        (a: Attendance, b: Attendance) => {
          const nameA = a.reporter?.project?.name ?? "";
          const nameB = b.reporter?.project?.name ?? "";
          return nameA.localeCompare(nameB);
        },
      );

      if (users.length !== sortedAttendances.length) {
        const notReportedUsers = getNotReportedUsers(users, attendances);
        await sendAttendanceReminderToTeams(notReportedUsers);
        throw new Error("Not all members have reported attendance!");
      }

      await sendAttendanceToTeamsUtils(sortedAttendances, users.length);
      isSuccess = true;
      logger.info("Attendance Teams notification sent successfully");
    } catch (error) {
      logger.error(`Attendance Teams notification failed (Attempt ${retryCount + 1})`, error as Error);
      retryCount++;
      await handleRetryDelay(retryCount);
    }
  }

  if (!isSuccess) {
    logger.error("Failed to send attendance Teams notification after all retries");
  }
};

const attendanceController = new AttendanceController();

// Export individual methods for route handlers
export const getAttendances = attendanceController.getAttendances;
export const getAttendanceById = attendanceController.getAttendanceById;
export const getAttendanceByIdAndDate = attendanceController.getAttendanceByIdAndDate;
export const createAttendance = attendanceController.createAttendance;
export const getAttendanceByDate = attendanceController.getAttendanceByDate;
