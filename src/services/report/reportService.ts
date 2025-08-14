import dayjs from "dayjs";
import prisma from "../../lib/prisma";
import { Report, ReportPayload, ReportStatus } from "../../types/report";
import { AdaptiveCardMessageType } from "@prisma/client";
import { BaseService } from "../common/baseService";
import { logger } from "../../utils/logger";
import { ValidationError } from "../../utils/errors";

class ReportService extends BaseService {
  constructor() {
    super(prisma);
  }

  /**
   * Get all reports with user information
   */
  async getAllReports(): Promise<Report[]> {
    return this.execute(async () => {
      return await this.prisma.report.findMany({
        include: { user: true },
        orderBy: { updated_at: 'desc' },
      });
    }, 'getAllReports');
  }

  /**
   * Get today's reports
   */
  async getTodayReports(): Promise<Report[]> {
    return this.execute(async () => {
      const { startDate, endDate } = this.getTodayRange();
      
      return await this.prisma.report.findMany({
        where: {
          updated_at: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: { user: true },
        orderBy: { updated_at: 'desc' },
      });
    }, 'getTodayReports');
  }

  /**
   * Get reports by user IDs
   */
  async getReportsByUserIds(userIds: number[]): Promise<Report[]> {
    return this.execute(async () => {
      const validIds = this.validateIds(userIds, 'User IDs');
      
      return await this.prisma.report.findMany({
        where: {
          user_id: { in: validIds },
        },
        include: { user: true },
        orderBy: { updated_at: 'desc' },
      });
    }, 'getReportsByUserIds');
  }

  /**
   * Get reports from one week ago
   */
  async getOneWeekAgoReports(): Promise<Report[]> {
    return this.execute(async () => {
      const { startDate } = this.getPeriodRange(9);
      
      return await this.prisma.report.findMany({
        where: {
          updated_at: { gte: startDate },
        },
        include: { user: true },
        orderBy: { updated_at: "desc" },
      });
    }, 'getOneWeekAgoReports');
  }

  /**
   * Get reports by user ID older than a week
   */
  async getReportsByIdAndWeekAgo(userId: number): Promise<Report[]> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      const weekAgo = dayjs().subtract(7, "day").toDate();
      
      return await this.prisma.report.findMany({
        where: {
          updated_at: { lt: weekAgo },
          user_id: validUserId,
        },
        include: { user: true },
        orderBy: { updated_at: "desc" },
      });
    }, 'getReportsByIdAndWeekAgo');
  }

  /**
   * Get reports by user IDs and specific date
   */
  async getReportsByIdAndDate(userIds: number[], date: string): Promise<Report[]> {
    return this.execute(async () => {
      const validIds = this.validateIds(userIds, 'User IDs');
      const { startDate, endDate } = this.getDateRange(date);
      
      return await this.prisma.report.findMany({
        where: {
          user_id: { in: validIds },
          updated_at: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          user: {
            include: { project: true },
          },
        },
        orderBy: { updated_at: "desc" },
      });
    }, 'getReportsByIdAndDate');
  }

  /**
   * Get today's reports by user ID and status
   */
  async getTodayReportsByUserIdAndStatus(userId: number, status: ReportStatus): Promise<Report[]> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      const { startDate, endDate } = this.getTodayRange();
      
      return await this.prisma.report.findMany({
        where: {
          user_id: validUserId,
          created_at: {
            gte: startDate,
            lt: endDate,
          },
          status: status,
        },
        include: { user: true },
        orderBy: { created_at: "desc" },
      });
    }, 'getTodayReportsByUserIdAndStatus');
  };

  /**
   * Create multiple reports
   */
  async createReports(reportPayload: ReportPayload[]): Promise<{ count: number }> {
    return this.execute(async () => {
      if (!Array.isArray(reportPayload) || reportPayload.length === 0) {
        throw new ValidationError('Report payload must be a non-empty array');
      }

      logger.info('Creating reports', { count: reportPayload.length });

      const result = await this.prisma.report.createMany({
        data: reportPayload,
        skipDuplicates: false,
      });

      logger.info('Reports created successfully', { created: result.count });
      
      return result;
    }, 'createReports');
  }

  /**
   * Check if a report exists for a specific user for today
   */
  async checkTodayReportExists(userId: number): Promise<boolean> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      const { startDate, endDate } = this.getTodayRange();

      const existingReport = await this.prisma.report.findFirst({
        where: {
          user_id: validUserId,
          created_at: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      return !!existingReport;
    }, 'checkTodayReportExists');
  }

/**
 * Update reports for a specific day by deleting existing ones and inserting new data
 * @param userId
 * @param reportPayload
 * @returns
 */
  /**
   * Update reports for a user (replace today's reports)
   */
  async updateUserReports(userId: number, reportPayload: ReportPayload[]): Promise<{ created: number }> {
    return this.executeWithTransaction(async (tx) => {
      const validUserId = this.validateId(userId, 'User ID');
      
      if (!Array.isArray(reportPayload) || reportPayload.length === 0) {
        throw new ValidationError('Report payload must be a non-empty array');
      }

      logger.info('Updating user reports', { userId: validUserId, count: reportPayload.length });

      const { startDate, endDate } = this.getTodayRange();

      // Delete existing reports for today
      await tx.report.deleteMany({
        where: {
          user_id: validUserId,
          created_at: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      // Prepare reports for insertion
      const reportsToInsert = reportPayload.map(({ id, ...report }) => ({
        ...report,
        user_id: validUserId,
      }));

      // Insert new reports
      const createResult = await tx.report.createMany({
        data: reportsToInsert,
        skipDuplicates: false,
      });

      logger.info('User reports updated successfully', { 
        userId: validUserId, 
        created: createResult.count 
      });

      return { created: createResult.count };
    }, 'updateUserReports');
  }

  /**
   * Save adaptive card message for reports
   */
  async saveAdaptiveCardMessage(messagePayload: any, userId: number): Promise<void> {
    return this.execute(async () => {
      const validUserId = this.validateId(userId, 'User ID');
      
      if (!messagePayload) {
        throw new ValidationError('Message payload cannot be null or undefined');
      }

      await this.prisma.adaptiveCardMessage.create({
        data: {
          card_message: JSON.stringify(messagePayload),
          type: AdaptiveCardMessageType.report,
          user_id: validUserId,
        },
      });

      logger.info('Adaptive card message saved', { userId: validUserId });
    }, 'saveAdaptiveCardMessage');
  }
}

const reportService = new ReportService();

// Legacy exports for backward compatibility
export const get = () => reportService.getAllReports();
export const getByToday = () => reportService.getTodayReports();
export const getByUserIds = (ids: number[]) => reportService.getReportsByUserIds(ids);
export const getOneWeekAgo = () => reportService.getOneWeekAgoReports();
export const getByIdAndWeekAgo = (id: number) => reportService.getReportsByIdAndWeekAgo(id);
export const getByIdAndDate = (ids: number[], date: string) => reportService.getReportsByIdAndDate(ids, date);
export const getTodayByUserIdAndStatus = (userId: number, status: ReportStatus) => reportService.getTodayReportsByUserIdAndStatus(userId, status);
export const create = (payload: ReportPayload[]) => reportService.createReports(payload);
export const update = (userId: number, payload: ReportPayload[]) => reportService.updateUserReports(userId, payload);
export const checkExistingReport = (userId: number) => reportService.checkTodayReportExists(userId);
export const saveAdaptiveCardMessage = (payload: any, userId: number) => reportService.saveAdaptiveCardMessage(payload, userId);
