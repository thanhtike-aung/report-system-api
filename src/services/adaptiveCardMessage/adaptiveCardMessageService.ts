import prisma from "../../lib/prisma";
import {
  AdaptiveCardMessage,
  AdaptiveCardMessageType,
} from "../../types/adaptiveCardMessage";
import { BaseService } from "../common/baseService";

class AdaptiveCardMessageService extends BaseService {
  constructor() {
    super(prisma);
  }

  /**
   * Get all adaptive card messages
   */
  async getAllMessages(): Promise<AdaptiveCardMessage[]> {
    return this.execute(async () => {
      return await this.prisma.adaptiveCardMessage.findMany({
        include: { user: true },
        orderBy: { created_at: "desc" },
      });
    }, "getAllMessages");
  }

  /**
   * Get adaptive card messages by type
   */
  async getMessagesByType(
    type: AdaptiveCardMessageType,
  ): Promise<AdaptiveCardMessage[]> {
    return this.execute(async () => {
      return await this.prisma.adaptiveCardMessage.findMany({
        where: { type },
        include: { user: true },
        orderBy: { created_at: "desc" },
      });
    }, "getMessagesByType");
  }
}

const adaptiveCardMessageService = new AdaptiveCardMessageService();

// Legacy exports for backward compatibility
export const get = () => adaptiveCardMessageService.getAllMessages();
export const getByType = (type: AdaptiveCardMessageType) =>
  adaptiveCardMessageService.getMessagesByType(type);
