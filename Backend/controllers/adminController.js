import Exam from '../models/Exam.js';
import ExamSession from '../models/ExamSession.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAdminStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const totalStudents = await User.countDocuments({ role : 'student' })
        const totalTeachers = await User.countDocuments({ role : 'teacher' })
        const totalAdmin = await User.countDocuments({ role : 'admin' })

        const totalExams = await Exam.countDocuments({})

        const totalSessions = await ExamSession.countDocuments({})
        const totalLockedSessions = await ExamSession.countDocuments({status : 'locked'})
        
        res.status(200).json({
            users : {
                students : totalStudents,
                teachers : totalTeachers,
                admin : totalAdmin,
                total : totalAdmin + totalStudents + totalTeachers
            },
            exams : {
                total : totalExams
            },
            sessions : {
                locked : totalLockedSessions,
                total :  totalSessions
            }
        });
    } catch (error) {
        return res.status(500).json({ message : error.message});
    }
};
