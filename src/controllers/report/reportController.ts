import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { Request, Response } from "express";
import {
  create as createReportsService,
  getByToday as getTodayReports,
  get as getReportsService,
  update as updateReportsService,
  getByIdAndDate,
} from "../../services/report/reportService";
import {
  sendReportReminderToTeamsUtils,
  sendReportToTeamsUtils,
} from "../../utils/report/sendToTeams";
import {
  get as getAllMembers,
  getAuthorizedReporters,
} from "../../services/user/userService";
import { User } from "types/user";
import dayjs from "dayjs";
import { getByToday as getTodayAttendances } from "../../services/attendance/attendanceService";

/**
 * get all reports
 * @param _req
 * @param res
 */
export const getReports = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reports = await getReportsService();
    res.status(STATUS_CODES.OK).json(reports);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * create reports
 * @param req
 * @param res
 */
export const createReports = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const createdReportsCount = await createReportsService(req.body);
    res.status(STATUS_CODES.OK).json(createdReportsCount);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * update reports
 * @param req
 * @param res
 */
export const updateReports = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedReportsCount = await updateReportsService(req.body);
    res.status(STATUS_CODES.OK).json(updatedReportsCount);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

export const sendReportReminderToTeams = async (): Promise<void> => {
  try {
    await sendReportReminderToTeamsUtils();
  } catch (error) {
    console.error(error);
  }
};

export const sendReportToTeams = async (): Promise<void> => {
  try {
    const today = dayjs().format("YYYY-MM-DD");
    const members = await getAllMembers();
    const reportSenders = await getAuthorizedReporters();
    const todayAttendances = await getTodayAttendances();
    const membersGroupedBy = reportSenders.map((sender) => ({
      workflowsUrl: sender.workflows_url,
      senderId: sender.id,
      ids: [
        sender.id,
        ...sender.subordinates.map((subordinate: User) => subordinate.id),
      ],
    }));
    membersGroupedBy.map(async (memberGroupedBy) => {
      const reports = await getByIdAndDate(memberGroupedBy.ids, today);

      sendReportToTeamsUtils(
        members,
        reports,
        todayAttendances,
        memberGroupedBy,
      );
    });
  } catch (error) {
    console.error(error);
  }
};
