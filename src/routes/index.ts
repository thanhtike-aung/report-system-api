import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { userRoutes } from './userRoutes';
import { projectRoutes } from './projectRoutes';
import { attendanceRoutes } from './attendanceRoutes';
import { reportRoutes } from './reportRoutes';
import { adaptiveCardMessageRoutes } from './adaptiveCardMessageRoutes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/reports', reportRoutes);
router.use('/adaptive-card-messages', adaptiveCardMessageRoutes);

export { router as apiRoutes };