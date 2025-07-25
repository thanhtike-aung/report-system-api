import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { NextFunction, Request, Response } from "express";
import {
  create as createAttendanceService,
  get as getAttendanceService,
  getById as getAttendanceByIdService,
  getByToday as getTodayAttendanceService,
  getByIdAndDate as getAttendanceByIdAndDateService,
  saveAdaptiveCardMessage,
} from "../../services/attendance/attendanceService";
import { NotFoundError } from "../../utils/errors";
import {
  getActiveUsers,
  get as getAllUsers,
} from "../../services/user/userService";
import {
  sendAttendanceReminderToTeams,
  sendAttendanceToTeams as sendAttendanceToTeamsUtils,
} from "../../utils/attendance/sendToTeams";
import { Attendance } from "types/attendance";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 15 * 60 * 1000;

/**
 *
 * @param req
 * @param res
 */
export const getAttendances = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const attendances = await getAttendanceService();
    res.status(STATUS_CODES.OK).json(attendances);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 *
 * @param req
 * @param res
 */
export const getAttendanceById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const attendance = await getAttendanceByIdService(Number(req.params.id));
    res.status(STATUS_CODES.OK).json(attendance);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 *
 * @param req
 * @param res
 */
export const getAttendanceByIdAndDate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const attendance = await getAttendanceByIdAndDateService(
      Number(req.params.id),
      req.params.date,
    );
    res.status(STATUS_CODES.OK).json(attendance);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 *
 * @param req
 * @param res
 */
export const createAttendance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const attendance = await createAttendanceService(req.body);
    res.status(STATUS_CODES.CREATED).json(attendance);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * get attendance by date
 * @param req
 * @param res
 */
export const getAttendanceByDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const attendance = await getTodayAttendanceService();
    if (!attendance)
      throw NotFoundError("Attendance " + MESSAGE.ERROR.NOT_FOUND);

    res.status(STATUS_CODES.OK).json(attendance);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

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
export const sendAttendanceToTeams = async (): Promise<void> => {
  let retryCount = 0;
  let isSuccess = false;

  while (retryCount <= MAX_RETRIES && !isSuccess) {
    try {
      console.log(
        `Attempting cron job (Attempt ${retryCount}/${MAX_RETRIES}) ...`,
      );

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
    } catch (error) {
      console.error(error);
      retryCount++;
      await handleRetryDelay(retryCount);
    }
  }
};
