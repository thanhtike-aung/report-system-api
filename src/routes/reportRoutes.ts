import { Router } from 'express';
import {
  getReports,
  getReportsByUserIds,
  getTodayReportsByUserIdAndStatus,
  createReports,
  updateReports,
  getOneWeekAgoReports,
  getReportsByIdAndWeekAgo,
  sendReportToTeams,
  sendReportReminder
} from '../controllers/report/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod } from '../middleware/validateZod';
import { createReportSchema, updateReportSchema, reportUserIdsSchema } from '../validations/schemas';

const router = Router();

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', authenticate, getReports);

/**
 * @swagger
 * /api/reports/user/ids:
 *   post:
 *     summary: Get reports by user IDs
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 */
router.post('/user/ids', authenticate, validateZod(reportUserIdsSchema), getReportsByUserIds);

/**
 * @swagger
 * /api/reports/today:
 *   get:
 *     summary: Get today's reports by user ID and status
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, success, failure]
 */
router.get('/today', authenticate, getTodayReportsByUserIdAndStatus);

/**
 * @swagger
 * /api/reports/weekago:
 *   get:
 *     summary: Get reports from the last week
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/weekago', authenticate, getOneWeekAgoReports);

/**
 * @swagger
 * /api/reports/weekago/{id}:
 *   get:
 *     summary: Get reports from the last week for a specific user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/weekago/:id', authenticate, getReportsByIdAndWeekAgo);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create new reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CreateReport'
 */
router.post('/', authenticate, validateZod(createReportSchema), createReports);

/**
 * @swagger
 * /api/reports/{userId}:
 *   patch:
 *     summary: Update reports for a user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 */
router.patch('/:userId', authenticate, validateZod(updateReportSchema), updateReports);

/**
 * @swagger
 * /api/reports/teams/send:
 *   post:
 *     summary: Send reports to Teams
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.post('/teams/send', authenticate, authorize('rootadmin', 'manager'), sendReportToTeams);

/**
 * @swagger
 * /api/reports/teams/remind:
 *   post:
 *     summary: Send report reminders to Teams
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.post('/teams/remind', authenticate, authorize('rootadmin', 'manager'), sendReportReminder);

export { router as reportRoutes };