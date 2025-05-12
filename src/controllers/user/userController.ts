import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { Request, Response } from "express";
import {
  create as createUserService,
  get as getUserService,
  getById as getUserByIdService,
  update as updateUserService,
  destroy as destroyUserService,
  getWithoutId as getUserWithoutIdService,
  deactivate as deactivateUserService,
} from "../../services/user/userService";
import { sendAccountEmail } from "../../utils/mailer";

/**
 * get all members
 * @param req
 * @param res
 */
export const getUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await getUserService();
    res.status(STATUS_CODES.OK).json(users);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * get user by id
 * @param req
 * @param res
 */
export const getUserById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await getUserByIdService(Number(req.params.id));
    res.status(STATUS_CODES.OK).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * create member
 * @param req
 * @param res
 */
export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await createUserService(req.body);
    sendAccountEmail(email, password).catch((error) =>
      console.error("Email sending failed.", error),
    );
    res.status(STATUS_CODES.CREATED).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * update member
 * @param req
 * @param res
 */
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await updateUserService(Number(req.params.id), req.body);
    res.status(STATUS_CODES.OK).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

export const deactiveUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await deactivateUserService(Number(req.params.id));
    res.status(STATUS_CODES.OK).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * delete user
 * @param req
 * @param res
 */
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const isDeleted = await destroyUserService(Number(req.params.id));
    if (!isDeleted) {
      res.status(STATUS_CODES.NOT_FOUND).json({ message: "user not found!" });
    }
    res.status(STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

export const getUsersExceptId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await getUserWithoutIdService(Number(req.params.id));
    res.status(STATUS_CODES.OK).json(users);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};
