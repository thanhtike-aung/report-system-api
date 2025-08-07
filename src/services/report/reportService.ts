import { BaseService } from '../base.service';
import { Report, ReportPayload, ReportStatus } from '../../types/models';
import { NotFoundError, ValidationError } from '../../utils/errors/AppError';
import dayjs from 'dayjs';
import { PrismaClient } from '@prisma/client';
import { sendReportToTeamsUtils, sendReportReminderToTeamsUtils } from '../../utils/report/sendToTeams';

export class ReportService extends BaseService {
  constructor() {
    super('report');
  }

  async findAll(): Promise<Report[]> {
    return this.prisma.report.findMany({
      include: {
        user: true
      }
    });
  }

  async findByUserIds(userIds: number[]): Promise<Report[]> {
    return this.prisma.report.findMany({
      where: {
        user_id: {
          in: userIds
        }
      },
      include: {
        user: true
      }
    });
  }

  async findTodayByUserIdAndStatus(userId: number, status: ReportStatus): Promise<Report[]> {
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().endOf('day');

    return this.prisma.report.findMany({
      where: {
        user_id: userId,
        status,
        created_at: {
          gte: today.toDate(),
          lte: tomorrow.toDate()
        }
      },
      include: {
        user: true
      }
    });
  }

  async checkExistingReport(userId: number): Promise<boolean> {
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().endOf('day');

    const existingReport = await this.prisma.report.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: today.toDate(),
          lte: tomorrow.toDate()
        }
      }
    });

    return !!existingReport;
  }

  async create(reports: ReportPayload[]): Promise<number> {
    const userIds = [...new Set(reports.map(report => report.user_id))];

    // Check for existing reports
    for (const userId of userIds) {
      const hasExistingReport = await this.checkExistingReport(userId);
      if (hasExistingReport) {
        throw new ValidationError('Report for today already exists. You cannot create multiple reports for the same day.');
      }
    }

    const createdReports = await this.prisma.report.createMany({
      data: reports
    });

    return createdReports.count;
  }

  async update(userId: number, data: Partial<Report>): Promise<Report> {
    const report = await this.prisma.report.update({
      where: {
        user_id: userId
      },
      data,
      include: {
        user: true
      }
    });

    if (!report) {
      throw new NotFoundError(`Report for user ${userId} not found`);
    }

    return report;
  }

  async findOneWeekAgo(): Promise<Report[]> {
    const oneWeekAgo = dayjs().subtract(7, 'day').startOf('day');
    const today = dayjs().endOf('day');

    return this.prisma.report.findMany({
      where: {
        created_at: {
          gte: oneWeekAgo.toDate(),
          lte: today.toDate()
        }
      },
      include: {
        user: true
      }
    });
  }

  async findByIdAndWeekAgo(userId: number): Promise<Report[]> {
    const oneWeekAgo = dayjs().subtract(7, 'day').startOf('day');
    const today = dayjs().endOf('day');

    return this.prisma.report.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: oneWeekAgo.toDate(),
          lte: today.toDate()
        }
      },
      include: {
        user: true
      }
    });
  }

  async sendReportToTeams(): Promise<void> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          can_report: true,
          is_active: true
        }
      });

      await sendReportToTeamsUtils(users);
    } catch (error) {
      console.error('Error sending report to Teams:', error);
      throw error;
    }
  }

  async sendReportReminder(): Promise<void> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          can_report: true,
          is_active: true
        }
      });

      await sendReportReminderToTeamsUtils(users);
    } catch (error) {
      console.error('Error sending report reminder:', error);
      throw error;
    }
  }
}