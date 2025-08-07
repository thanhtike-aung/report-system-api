import { Request, Response } from 'express';
import { BaseController } from '../base.controller';
import { ReportService } from '../../services/report/reportService';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponse } from '../../utils/response/ApiResponse';
import { ReportStatus } from '../../types/models';

export class ReportController extends BaseController {
  protected service: ReportService;

  constructor() {
    super();
    this.service = new ReportService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const reports = await this.service.findAll();
    return res.json(ApiResponse.success(reports));
  });

  getByUserIds = asyncHandler(async (req: Request, res: Response) => {
    const userIds = req.body.ids;
    if (!Array.isArray(userIds) || userIds.some(isNaN)) {
      throw new Error('Invalid request format.');
    }

    const reports = await this.service.findByUserIds(userIds);
    return res.json(ApiResponse.success(reports));
  });

  getTodayByUserIdAndStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    const status = req.query.status as ReportStatus;

    if (!userId || !status) {
      throw new Error('User ID and status are required');
    }

    const reports = await this.service.findTodayByUserIdAndStatus(userId, status);
    return res.json(ApiResponse.success(reports));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const createdCount = await this.service.create(req.body);
    return res.status(201).json(ApiResponse.success({ count: createdCount }));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const report = await this.service.update(userId, req.body);
    return res.json(ApiResponse.success(report));
  });

  getOneWeekAgo = asyncHandler(async (_req: Request, res: Response) => {
    const reports = await this.service.findOneWeekAgo();
    return res.json(ApiResponse.success(reports));
  });

  getByIdAndWeekAgo = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const reports = await this.service.findByIdAndWeekAgo(id);
    return res.json(ApiResponse.success(reports));
  });

  sendToTeams = asyncHandler(async (_req: Request, res: Response) => {
    await this.service.sendReportToTeams();
    return res.json(ApiResponse.success({ message: 'Reports sent to Teams successfully' }));
  });

  sendReminder = asyncHandler(async (_req: Request, res: Response) => {
    await this.service.sendReportReminder();
    return res.json(ApiResponse.success({ message: 'Report reminders sent successfully' }));
  });
}

// Create controller instance
const reportController = new ReportController();

// Export controller methods
export const {
  getAll: getReports,
  getByUserIds: getReportsByUserIds,
  getTodayByUserIdAndStatus: getTodayReportsByUserIdAndStatus,
  create: createReports,
  update: updateReports,
  getOneWeekAgo: getOneWeekAgoReports,
  getByIdAndWeekAgo: getReportsByIdAndWeekAgo,
  sendToTeams: sendReportToTeams,
  sendReminder: sendReportReminder
} = reportController;