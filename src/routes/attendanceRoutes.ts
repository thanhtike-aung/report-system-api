import { Router } from 'express';
import {
  getAttendances,
  getAttendanceById,
  getAttendanceByIdAndDate,
  getAttendanceByDate,
  createAttendance,
  sendAttendanceToTeams,
  sendAttendanceReminder
} from '../controllers/attendance/attendanceController';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod } from '../middleware/validateZod';
import { createAttendanceSchema } from '../validations/schemas';

const router = Router();

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/', authenticate, getAttendances);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get attendance by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authenticate, getAttendanceById);

/**
 * @swagger
 * /api/attendance/{id}/{date}:
 *   get:
 *     summary: Get attendance by ID and date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/:id/:date', authenticate, getAttendanceByIdAndDate);

/**
 * @swagger
 * /api/attendance/date/today:
 *   get:
 *     summary: Get today's attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/date/today', authenticate, getAttendanceByDate);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Create new attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttendance'
 */
router.post('/', authenticate, validateZod(createAttendanceSchema), createAttendance);

/**
 * @swagger
 * /api/attendance/teams/send:
 *   post:
 *     summary: Send attendance to Teams
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/teams/send', authenticate, authorize('rootadmin', 'manager'), sendAttendanceToTeams);

/**
 * @swagger
 * /api/attendance/teams/remind:
 *   post:
 *     summary: Send attendance reminders to Teams
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/teams/remind', authenticate, authorize('rootadmin', 'manager'), sendAttendanceReminder);

export { router as attendanceRoutes };