import express from 'express';
import {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/register', registerUser);

router.post('/login', loginUser);


router.route('/')
    .get(protect, authorize('teacher'), getUsers);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, authorize('teacher'), deleteUser);

export default router;
