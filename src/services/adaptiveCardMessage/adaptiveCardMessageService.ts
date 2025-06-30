import prisma from "../../lib/prisma";
import {
  AdaptiveCardMessage,
  AdaptiveCardMessageType,
} from "../../types/adaptiveCardMessage";

export const get = async (): Promise<Array<AdaptiveCardMessage>> => {
  return await prisma.adaptiveCardMessage.findMany({
    include: { user: true },
  });
};

export const getByType = async (type: AdaptiveCardMessageType) => {
  return await prisma.adaptiveCardMessage.findMany({
    where: {
      type,
    },
  });
};
