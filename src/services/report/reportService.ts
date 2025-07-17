import dayjs from "dayjs";
import prisma from "../../lib/prisma";
import { Report, ReportPayload, ReportStatus } from "../../types/report";
import { AdaptiveCardMessageType } from "@prisma/client";

/**
 * get all reports
 * @returns
 */
export const get = async (): Promise<Array<Report>> => {
  return await prisma.report.findMany({
    include: { user: true },
  });
};

export const getByToday = async (): Promise<Array<Report>> => {
  return await prisma.report.findMany({
    where: {
      updated_at: {
        gte: dayjs().startOf("day").toDate(),
        lt: dayjs().endOf("day").toDate(),
      },
    },
  });
};

export const getByUserIds = async (ids: number[]): Promise<Array<Report>> => {
  return await prisma.report.findMany({
    where: {
      user_id: {
        in: ids,
      },
    },
  });
};

export const getOneWeekAgo = async (): Promise<Array<Report>> => {
  const oneWeekAgo = dayjs().subtract(9, "day").toDate();
  return await prisma.report.findMany({
    where: {
      updated_at: {
        gte: oneWeekAgo,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });
};

export const getByIdAndWeekAgo = async (id: number): Promise<Array<Report>> => {
  const weekAgo = dayjs().subtract(7, "day").toDate();
  return prisma.report.findMany({
    where: {
      updated_at: {
        lt: weekAgo,
      },
      user_id: id,
    },
  });
};

export const getByIdAndDate = async (
  ids: any[],
  date: string,
): Promise<any> => {
  const startOfDay = dayjs(date).startOf("day").toDate();
  const endOfDay = dayjs(date).endOf("day").toDate();
  return await prisma.report.findMany({
    where: {
      user_id: {
        in: ids,
      },
      updated_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    include: {
      user: {
        include: { project: true },
      },
    },
  });
};

export const getTodayByUserIdAndStatus = async (
  userId: number,
  status: ReportStatus,
): Promise<any> => {
  const startOfDay = dayjs(new Date()).startOf("day").toDate();
  const endOfDay = dayjs(new Date()).endOf("day").toDate();
  return await prisma.report.findMany({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: status,
    },
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
 * Check if a report exists for a specific user for today
 * @param userId
 * @returns boolean
 */
export const checkExistingReport = async (userId: number): Promise<boolean> => {
  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  const existingReport = await prisma.report.findFirst({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  return !!existingReport;
};

/**
 * Update reports for a specific day by deleting existing ones and inserting new data
 * @param userId
 * @param reportPayload
 * @returns
 */
export const update = async (
  userId: number,
  reportPayload: ReportPayload[],
): Promise<any> => {
  // Delete all reports for this user for today
  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  await prisma.report.deleteMany({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  // Prepare all reports for insertion
  const reportsToInsert = reportPayload.map(({ id, ...report }) => ({
    ...report,
    user_id: userId,
  }));

  // Insert all reports
  const createResult = await prisma.report.createMany({
    data: reportsToInsert,
    skipDuplicates: false,
  });

  return {
    created: createResult.count,
  };
};

export const saveAdaptiveCardMessage = async (
  messagePayload: any,
  userId: number,
): Promise<void> => {
  try {
    if (!messagePayload) {
      throw new Error("Message Payload cannot be null or undefined.");
    }
    await prisma.adaptiveCardMessage.create({
      data: {
        card_message: JSON.stringify(messagePayload),
        type: AdaptiveCardMessageType.report,
        user_id: userId,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
