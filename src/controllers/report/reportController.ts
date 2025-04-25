import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { Request, Response } from "express";
import {
  create as createReportsService,
  get as getReportsService,
  update as updateReportsService,
} from "../../services/report/reportService";

/**
 * get all reports
 * @param _req
 * @param res
 */
export const getReports = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reports = await getReportsService();
    res.status(STATUS_CODES.OK).json(reports);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * create reports
 * @param req
 * @param res
 */
export const createReports = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const createdReportsCount = await createReportsService(req.body);
    res.status(STATUS_CODES.OK).json(createdReportsCount);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * update reports
 * @param req
 * @param res
 */
export const updateReports = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updatedReportsCount = await updateReportsService(req.body);
    res.status(STATUS_CODES.OK).json(updatedReportsCount);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};
