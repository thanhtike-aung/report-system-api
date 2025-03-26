import { MESSAGE, STATUS_CODES } from "../../constants/messages";
import { NextFunction, Request, Response } from "express";
import {
  create as createReportService,
  getByToday as getTodayReportService,
  get as getReportService,
} from "../../services/report/reportService";
import { NotFoundError } from "../../utils/errors";

/**
 *
 * @param req
 * @param res
 */
export const getReports = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reports = await getReportService();
    res.status(STATUS_CODES.OK).json(reports);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 *
 * @param req
 * @param res
 */
export const createReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const report = await createReportService(req.body);
    res.status(STATUS_CODES.CREATED).json(report);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};

/**
 * get report by date
 * @param req
 * @param res
 */
export const getReportByDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const report = await getTodayReportService();
    if (!report) throw NotFoundError("Report " + MESSAGE.ERROR.NOT_FOUND);

    res.status(STATUS_CODES.OK).json(report);
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: MESSAGE.ERROR.SERVER_ERROR });
  }
};
