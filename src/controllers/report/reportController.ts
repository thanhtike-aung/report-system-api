import { Request, Response, NextFunction } from "express";
import { BaseController } from "../common/baseController";
import { validateInput, validateIds } from "../../utils/validation";
import {
  create as createReportsService,
  getByToday as getTodayReports,
  get as getReportsService,
  update as updateReportsService,
  getByIdAndDate,
  getByUserIds as getReportsByUserIdsService,
  getOneWeekAgo as getOneWeekAgoReportsService,
  getByIdAndWeekAgo as getReportsByIdAndWeekAgoService,
  getTodayByUserIdAndStatus as getTodayByUserIdAndStatusService,
  checkExistingReport as checkExistingReportService,
} from "../../services/report/reportService";
import {
  sendReportReminderToTeamsUtils,
  sendReportToTeamsUtils,
} from "../../utils/report/sendToTeams";
import {
  get as getAllMembers,
  getOnlyAuthorizedReporters,
} from "../../services/user/userService";
import { User } from "types/user";
import dayjs from "dayjs";
import { getByToday as getTodayAttendances } from "../../services/attendance/attendanceService";
import { ReportStatus } from "types/report";
import { ReportPayload } from "types/report";
import { STATUS_CODES } from "../../constants/messages";
import { logger } from "../../utils/logger";

class ReportController extends BaseController {
  /**
   * Get all reports
   */
  public getReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getReportsService();
      },
      "Reports retrieved successfully",
    );
  };

  /**
   * Get reports by user IDs
   */
  public getReportsByUserIds = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        validateInput(req.body, [
          { field: "ids", required: true, type: "array" },
        ]);

        const ids = validateIds(req.body.ids);
        return await getReportsByUserIdsService(ids);
      },
      "Reports retrieved successfully",
    );
  };

  /**
   * Get today's reports by user ID and status
   */
  public getTodayReportsByUserIdAndStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const userId = Number(req.query.userId);
        if (isNaN(userId) || userId <= 0) {
          throw new Error("Valid userId query parameter is required");
        }
        const status = req.query.status as ReportStatus;

        if (!status) {
          throw new Error("Status parameter is required");
        }

        return await getTodayByUserIdAndStatusService(userId, status);
      },
      "Today's reports retrieved successfully",
    );
  };

  /**
   * Create reports with validation
   */
  public createReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const reports = req.body as ReportPayload[];
        const userIds = [...new Set(reports.map((report) => report.user_id))];

        // Check for existing reports
        for (const userId of userIds) {
          const hasExistingReport = await checkExistingReportService(userId);
          if (hasExistingReport) {
            return {
              status: STATUS_CODES.CONFLICT,
              message:
                "Report for today already exists. You cannot create multiple reports for the same day.",
            };
          }
        }

        logger.info("Creating reports", {
          userCount: userIds.length,
          reportCount: reports.length,
        });
        return await createReportsService(reports);
      },
      "Reports created successfully",
      STATUS_CODES.CREATED,
    );
  };

  /**
   * Get reports by user IDs and date
   */
  public getReportsByIdAndDate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        validateInput(req.body, [
          { field: "ids", required: true, type: "array" },
          { field: "date", required: true, type: "string" },
        ]);

        const ids = validateIds(req.body.ids);
        const { date } = req.body;
        return await getByIdAndDate(ids, date);
      },
      "Reports retrieved successfully",
    );
  };

  /**
   * Get one week ago reports
   */
  public getOneWeekAgoReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getOneWeekAgoReportsService();
      },
      "Week-old reports retrieved successfully",
    );
  };

  /**
   * Get reports by user ID older than a week
   */
  public getReportsByIdAndWeekAgo = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const userId = this.getIdFromParams(req);
        return await getReportsByIdAndWeekAgoService(userId);
      },
      "Old reports retrieved successfully",
    );
  };

  /**
   * Update reports for a user
   */
  public updateReports = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const userId = this.getIdFromParams(req, "userId");

        validateInput(req.body, [
          { field: "reports", required: true, type: "array" },
        ]);

        const reports = req.body;
        logger.info("Updating reports", {
          userId,
          reportCount: reports.length,
        });
        return await updateReportsService(userId, reports);
      },
      "Reports updated successfully",
    );
  };
}

/**
 * Helper functions for Teams integration
 */
const getNotReportedUsers = (users: User[], reports: any[]) => {
  const reportedUserIds = reports.map((report) => report.user_id);
  return users.filter((user) => !reportedUserIds.includes(user.id));
};

/**
 * Send report reminder to Teams (for cron job)
 */
export const sendReportReminderToTeams = async (): Promise<void> => {
  try {
    logger.info("Starting report reminder Teams notification");

    const reportSenders = await getOnlyAuthorizedReporters();
    const todayReports = await getTodayReports();
    const notReportedUsers = getNotReportedUsers(reportSenders, todayReports);

    if (notReportedUsers.length > 0) {
      logger.info("Sending report reminder", {
        notReportedCount: notReportedUsers.length,
      });
      await sendReportReminderToTeamsUtils();
      logger.info("Report reminder sent successfully");
    } else {
      logger.info("All users have submitted reports, no reminder needed");
    }
  } catch (error) {
    logger.error("Failed to send report reminder to Teams", error as Error);
    throw error;
  }
};

/**
 * Send reports to Teams (for cron job)
 */
export const sendReportToTeams = async (): Promise<void> => {
  try {
    logger.info("Starting report Teams notification");

    const reportSenders = await getOnlyAuthorizedReporters();
    const attendances = await getTodayAttendances();

    // Group members by project
    const membersGroupedBy = reportSenders.map((sender) => ({
      projectName: sender.project?.name || "Unknown Project",
      data: [sender],
    }));

    const promises = membersGroupedBy.map(async (memberGroupedBy) => {
      console.log(memberGroupedBy);
      const reports = await getByIdAndDate(
        memberGroupedBy.data.map((user) => user.id),
        dayjs().format("YYYY-MM-DD"),
      );
      // console.log(reports);

      if (reports.length > 0) {
        await sendReportToTeamsUtils(
          memberGroupedBy.data,
          reports,
          attendances,
          memberGroupedBy,
        );
      }
    });

    await Promise.all(promises);
    logger.info("Reports sent to Teams successfully");
  } catch (error) {
    logger.error("Failed to send reports to Teams", error as Error);
    throw error;
  }
};

const reportController = new ReportController();

// Export individual methods for route handlers
export const getReports = reportController.getReports;
export const getReportsByUserIds = reportController.getReportsByUserIds;
export const getTodayReportsByUserIdAndStatus =
  reportController.getTodayReportsByUserIdAndStatus;
export const createReports = reportController.createReports;
export const getReportsByIdAndDate = reportController.getReportsByIdAndDate;
export const getOneWeekAgoReports = reportController.getOneWeekAgoReports;
export const getReportsByIdAndWeekAgo =
  reportController.getReportsByIdAndWeekAgo;
export const updateReports = reportController.updateReports;
