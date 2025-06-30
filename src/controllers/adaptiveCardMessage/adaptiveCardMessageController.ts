import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { Request, Response } from "express";
import {
  get as getAdaptiveCardMessagesService,
  getByType as getAdaptiveCardMessagesByTypeService,
} from "../../services/adaptiveCardMessage/adaptiveCardMessageService";
import { AdaptiveCardMessageType } from "types/adaptiveCardMessage";

export const getAdaptiveCardMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cardMessages = await getAdaptiveCardMessagesService();
    res.status(STATUS_CODES.OK).json(cardMessages);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

export const getAdaptiveCardMessagesWithType = async (
  req: Request,
  res: Response,
) => {
  try {
    const cardMessages = await getAdaptiveCardMessagesByTypeService(
      req.params.type as AdaptiveCardMessageType,
    );
    res.status(STATUS_CODES.OK).json(cardMessages);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};
