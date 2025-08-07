import { Request, Response } from 'express';
import { BaseController } from '../base.controller';
import { AttendanceService } from '../../services/attendance/attendanceService';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponse } from '../../utils/response/ApiResponse';
import { NotFoundError } from '../../utils/errors/AppError';

export class AttendanceController extends BaseController {
  protected service: AttendanceService;

  constructor() {
    super();
    this.service = new AttendanceService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const attendances = await this.service.findAll();
    return res.json(ApiResponse.success(attendances));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const attendance = await this.service.findById(id);
    return res.json(ApiResponse.success(attendance));
  });

  getByIdAndDate = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const date = req.params.date;
    const attendances = await this.service.findByIdAndDate(id, date);
    return res.json(ApiResponse.success(attendances));
  });

  getByDate = asyncHandler(async (_req: Request, res: Response) => {
    const attendances = await this.service.findToday();
    if (!attendances.length) {
      throw new NotFoundError('No attendance records found for today');
    }
    return res.json(ApiResponse.success(attendances));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await this.service.create(req.body);
    return res.status(201).json(ApiResponse.success(attendance));
  });

  sendToTeams = asyncHandler(async (_req: Request, res: Response) => {
    await this.service.sendToTeams();
    return res.json(ApiResponse.success({ message: 'Attendance sent to Teams successfully' }));
  });

  sendReminder = asyncHandler(async (_req: Request, res: Response) => {
    await this.service.sendReminder();
    return res.json(ApiResponse.success({ message: 'Attendance reminders sent successfully' }));
  });
}

// Create controller instance
const attendanceController = new AttendanceController();

// Export controller methods
export const {
  getAll: getAttendances,
  getById: getAttendanceById,
  getByIdAndDate: getAttendanceByIdAndDate,
  getByDate: getAttendanceByDate,
  create: createAttendance,
  sendToTeams: sendAttendanceToTeams,
  sendReminder: sendAttendanceReminder
} = attendanceController;