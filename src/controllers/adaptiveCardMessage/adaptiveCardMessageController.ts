import { Request, Response } from 'express';
import { BaseController } from '../base.controller';
import { AdaptiveCardMessageService } from '../../services/adaptiveCardMessage/adaptiveCardMessageService';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponse } from '../../utils/response/ApiResponse';
import { AdaptiveCardMessageType } from '../../types/models';

export class AdaptiveCardMessageController extends BaseController {
  protected service: AdaptiveCardMessageService;

  constructor() {
    super();
    this.service = new AdaptiveCardMessageService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const messages = await this.service.findAll();
    return res.json(ApiResponse.success(messages));
  });

  getByType = asyncHandler(async (req: Request, res: Response) => {
    const type = req.params.type as AdaptiveCardMessageType;
    const messages = await this.service.findByType(type);
    return res.json(ApiResponse.success(messages));
  });
}

// Create controller instance
const adaptiveCardMessageController = new AdaptiveCardMessageController();

// Export controller methods
export const {
  getAll: getAdaptiveCardMessages,
  getByType: getAdaptiveCardMessagesByType
} = adaptiveCardMessageController;