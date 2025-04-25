import prisma from "../../lib/prisma";
import { Report, ReportPayload } from "../../types/report";

/**
 * get all reports
 * @returns
 */
export const get = async (): Promise<Array<Report>> => {
  return await prisma.report.findMany({
    include: { user: true },
  });
};

/**
 * create reports
 * @param reportPayload
 * @returns
 */
export const create = async (
  reportPayload: ReportPayload[],
): Promise<{ count: number }> => {
  return await prisma.report.createMany({
    data: reportPayload,
    skipDuplicates: false,
  });
};

/**
 * update reports
 * @param reportPayload
 * @returns
 */
export const update = async (
  reportPayload: ReportPayload[],
): Promise<{ count: number }> => {
  return await prisma.report.updateMany({
    data: reportPayload,
  });
};
