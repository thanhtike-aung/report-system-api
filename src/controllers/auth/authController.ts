import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { Request, Response } from "express";
import {
  changePassword as changePasswordService,
  login as loginService,
} from "../../services/auth/authService";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, message, token } = await loginService(req.body);
    if (status !== STATUS_CODES.OK) {
      res.status(status).json({ message });
    }
    res.status(status).json(token);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, data, message } = await changePasswordService(req.body);
    if (status === STATUS_CODES.UNAUTHORIZED) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: message });
    }
    res.status(STATUS_CODES.OK).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};
