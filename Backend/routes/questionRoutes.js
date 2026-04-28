import express from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();


router.route('/')
    .get(protect, authorize('teacher', 'admin'), getQuestions)
    .post(protect, authorize('teacher', 'admin'), createQuestion);


router.route('/:id')
    .get(protect, authorize('teacher','admin'), getQuestionById)
    .put(protect, authorize('teacher', 'admin'), updateQuestion)
    .delete(protect, authorize('teacher', 'admin'), deleteQuestion);

export default router;
