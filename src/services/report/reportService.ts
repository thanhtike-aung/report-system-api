import dayjs from "dayjs";
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
  const weekAgo = dayjs().subtract(10, "day").toDate();
  return prisma.report.findMany({
    where: {
      updated_at: {
        lt: weekAgo,
      },
      user_id: id,
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
        user_id: userId,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
