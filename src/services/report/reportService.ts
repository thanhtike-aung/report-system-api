import { minutesDifferFrom } from "../../utils/dayjs";
import {
  LEAVE_REASON,
  REPORT_STATUS,
  TYPE,
  WORKING_TIME,
} from "../../constants/report";
import prisma from "../../lib/prisma";
import {
  CreateReportPayload,
  LeavePeriod,
  Report,
  ReportType,
  WorkingTime,
} from "../../types/report";
import { ReportStatus } from "@prisma/client";

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
 * Get all reports.
 * @returns
 */
export const get = async (): Promise<Array<Report>> => {
  return prisma.report.findMany();
};

/**
 * Save report.
 * @param report
 * @returns
 */
export const create = async (report: CreateReportPayload): Promise<Report> => {
  const modifiedLeavePeriod = determineLeavePeriod(
    report.workingTime,
    report.leavePeriod,
  );
  const leaveReason = determineLeaveReason(
    report.leaveReason,
    report.otherLeaveReason,
  );
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  const existingReport = await prisma.report.findFirst({
    where: {
      reported_by: report.reportedBy,
      created_at: {
        gte: todayStart,
        lt: todayEnd,
      },
      status: REPORT_STATUS.PENDING as ReportStatus,
    },
  });

  const reportData = {
    type:
      report.workingTime === WORKING_TIME.FULL
        ? (TYPE.WORKING as ReportType)
        : (TYPE.LEAVE as ReportType),
    workspace: report.workspace,
    project: report.project,
    leave_period:
      report.workingTime === WORKING_TIME.FULL
        ? report.leavePeriod
        : modifiedLeavePeriod,
    leave_reason: leaveReason,
    late_minute:
      report.lateMinute !== null ? minutesDifferFrom(report.lateMinute, 8) : 0,
    reported_by: report.reportedBy,
    created_by: report.createdBy,
    status: REPORT_STATUS.PENDING as ReportStatus,
  };

  /* NOTE: can't use upsert because there is no "id" to provided in where */
  if (existingReport) {
    return prisma.report.update({
      where: { id: existingReport.id },
      data: reportData,
    });
  } else {
    return prisma.report.create({
      data: reportData,
    });
  }
};

/**
 * get today reports
 * @param
 * @returns
 */
export const getByToday = async (): Promise<Report[]> => {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  return await prisma.report.findMany({
    where: {
      updated_at: {
        gte: todayStart,
        lt: todayEnd,
      },
      status: REPORT_STATUS.PENDING as ReportStatus,
    },
    include: {
      reporter: {
        include: { project: true },
      },
    },
  });
};
