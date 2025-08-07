import { Router } from 'express';
import {
  getAdaptiveCardMessages,
  getAdaptiveCardMessagesByType
} from '../controllers/adaptiveCardMessage/adaptiveCardMessageController';
import { authenticate } from '../middleware/auth';
import { validateZod } from '../middleware/validateZod';
import { adaptiveCardMessageTypeSchema } from '../validations/schemas';

const router = Router();

/**
 * @swagger
 * /api/adaptive-card-messages:
 *   get:
 *     summary: Get all adaptive card messages
 *     tags: [AdaptiveCardMessages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of adaptive card messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdaptiveCardMessage'
 */
router.get('/', authenticate, getAdaptiveCardMessages);

/**
 * @swagger
 * /api/adaptive-card-messages/{type}:
 *   get:
 *     summary: Get adaptive card messages by type
 *     tags: [AdaptiveCardMessages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [attendance, report]
 *     responses:
 *       200:
 *         description: List of adaptive card messages by type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdaptiveCardMessage'
 */
router.get(
  '/:type',
  authenticate,
  validateZod(adaptiveCardMessageTypeSchema),
  getAdaptiveCardMessagesByType
);

export { router as adaptiveCardMessageRoutes };