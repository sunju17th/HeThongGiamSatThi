import express from 'express';
import {
    getSessions,
    getSessionById,
    addLog,
    submitSession,
    deleteSession
} from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSessions);


router.post('/:sessionId/logs', protect, authorize('student'), addLog);


router.post('/:sessionId/submit', protect, authorize('student'), submitSession);

router.route('/:id')
    .get(protect, getSessionById)
    .delete(protect, authorize('teacher'), deleteSession);

export default router;
