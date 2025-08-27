import { Request, Response, NextFunction } from "express";
import { BaseController } from "../common/baseController";
import {
  get as getAdaptiveCardMessagesService,
  getByType as getAdaptiveCardMessagesByTypeService,
} from "../../services/adaptiveCardMessage/adaptiveCardMessageService";
import { AdaptiveCardMessageType } from "types/adaptiveCardMessage";

class AdaptiveCardMessageController extends BaseController {
  /**
   * Get all adaptive card messages
   */
  public getAdaptiveCardMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        return await getAdaptiveCardMessagesService();
      },
      "Adaptive card messages retrieved successfully",
    );
  };

  /**
   * Get adaptive card messages by type
   */
  public getAdaptiveCardMessagesWithType = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      next,
      async () => {
        const type = req.params.type as AdaptiveCardMessageType;

        if (!type) {
          throw new Error("Type parameter is required");
        }

        return await getAdaptiveCardMessagesByTypeService(type);
      },
      "Adaptive card messages retrieved successfully",
    );
  };
}

const adaptiveCardMessageController = new AdaptiveCardMessageController();

// Export individual methods for route handlers
export const getAdaptiveCardMessages =
  adaptiveCardMessageController.getAdaptiveCardMessages;
export const getAdaptiveCardMessagesWithType =
  adaptiveCardMessageController.getAdaptiveCardMessagesWithType;
