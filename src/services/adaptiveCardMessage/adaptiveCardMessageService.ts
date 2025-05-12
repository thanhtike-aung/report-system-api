import prisma from "../../lib/prisma";
import { AdaptiveCardMessage } from "../../types/adaptiveCardMessage";

export const get = async (): Promise<Array<AdaptiveCardMessage>> => {
  return await prisma.adaptiveCardMessage.findMany({
    include: { user: true },
  });
};
