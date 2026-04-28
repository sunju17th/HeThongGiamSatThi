import express from 'express';
import {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
    joinExam,
    getExamSessions,
} from '../controllers/examController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();


router.route('/')
    .get(protect, getExams)
    .post(protect, authorize('teacher','admin'), createExam);


router.route('/:id')
    .get(protect, getExamById)
    .put(protect, authorize('teacher','admin'), updateExam)
    .delete(protect, authorize('teacher','admin'), deleteExam);


router.route('/:id/sessions').get(protect, getExamSessions);


router.post('/:id/join', protect, authorize('student'), joinExam);



export default router;
