import Exam from '../models/Exam.js';
import ExamSession from '../models/ExamSession.js';
import mongoose from 'mongoose';

// tao ki thi 
export const createExam = async (req, res) => {
    try {
        const exam = new Exam({
            ...req.body,
            teacher_id: req.user._id,
        });

        const createdExam = await exam.save();
        res.status(201).json(createdExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// lay tat ca ki thi
export const getExams = async (req, res) => {
    try {
        let exams;

        // Nếu là giáo viên, chỉ lấy các kỳ thi do giáo viên đó tạo
        if (req.user.role === 'teacher') {
            exams = await Exam.find({ teacher_id: req.user._id })
                .populate('questions', '-correct_answer'); 
        }
        // Nếu là sinh viên, chỉ lấy các kỳ thi mà sinh viên đó được phép tham gia
        else if (req.user.role === 'student') {
            exams = await Exam.find({ allowed_students: req.user._id })
                .populate('questions', '-correct_answer');
        } else {
            return res.status(403).json({ message: 'Vai trò người dùng không hợp lệ' });
        }

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// lay ki thi theo id
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy bài thi' });
        }

        const isTeacherOwner = req.user.role === 'teacher' && exam.teacher_id.toString() === req.user._id.toString();
        
        const isAllowedStudent = req.user.role === 'student' && exam.allowed_students.includes(req.user._id);

        if (!isTeacherOwner && !isAllowedStudent) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập vào bài thi này' });
        }


        let finalExam;

        if (isTeacherOwner) {
            finalExam = await Exam.findById(req.params.id)
                .populate('questions') 
                .populate('allowed_students', 'full_name username role');
        } else {
            finalExam = await Exam.findById(req.params.id)
                .populate('questions', '-correct_answer')
                .populate('allowed_students', 'full_name username role');
        }

        res.json(finalExam);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// cap nhat ki thi
export const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy bài thi' });
        }

        if (exam.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bài thi này' });
        }

        exam.title = req.body.title || exam.title;
        exam.duration_minutes = req.body.duration_minutes || exam.duration_minutes;
        exam.start_time = req.body.start_time || exam.start_time;
        exam.end_time = req.body.end_time || exam.end_time;
        exam.questions = req.body.questions || exam.questions;
        exam.allowed_students = req.body.allowed_students || exam.allowed_students;

        const updatedExam = await exam.save();
        res.json(updatedExam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// xoa ki thi
export const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this exam' });
        }

        await exam.deleteOne();
        res.json({ message: 'Exam removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// tham gia thi 
export const joinExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Không tìm thấy bài thi' });

        const isAllowedStudent = exam.allowed_students.some((studentId) => studentId.toString() === req.user._id.toString());
        if (!isAllowedStudent) return res.status(403).json({ message: 'Bạn không có quyền tham gia kỳ thi này.' });

        const now = new Date();
        if (now < exam.start_time || now > exam.end_time) {
            return res.status(403).json({ message: 'Kỳ thi hiện chưa bắt đầu hoặc đã kết thúc.' });
        }

        let session = await ExamSession.findOne({ exam_id: exam._id, student_id: req.user._id });
        
        if (!session) {
            session = await ExamSession.create({
                exam_id: exam._id,
                student_id: req.user._id,
                start_time: now,
                status: 'ongoing',
                violation_count: 0 
            });
            return res.status(200).json(session);
        } else {
            if (session.status === 'submitted' || session.status === 'abandoned' || session.status === 'locked') {
                return res.status(403).json({ message: `Không thể vào thi. Trạng thái bài thi: ${session.status}` });
            }

            session.proctoring_logs.push({
                event_type: 'reconnected', 
                description: 'Kết nối lại sau khi bị gián đoạn/tải lại trang',
                timestamp: now
            });
            
            session.violation_count += 1; // neu vao lai thi tinh mot lan vi pham ̣reconnect

            if (session.violation_count >= exam.max_violations) {
                session.status = 'locked';
                session.submit_time = now;
                await session.save();
                
                return res.status(403).json({ 
                    message: 'BÀI THI BỊ KHÓA: Bạn đã vượt quá số lần vi phạm cho phép (Bao gồm cả việc tải lại trang/mất kết nối)!',
                    session: session 
                });
            }

            await session.save();
            return res.status(200).json(session);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// lay danh sach session cua 1 ki thi
export const getExamSessions = async (req, res) => {
    try {
        const examId = req.params.id;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy bài thi' });
        }

        if (req.user.role !== 'teacher' || exam.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bảo mật: Chỉ giáo viên chủ trì mới được xem danh sách thi này!' });
        }

        const sessions = await ExamSession.find({ exam_id: examId })
            .populate('student_id', 'full_name username') 
            .sort({ violation_count: -1, start_time: -1 });

        const totalSessions = sessions.length;
        const ongoingCount = sessions.filter(s => s.status === 'ongoing').length;
        const lockedCount = sessions.filter(s => s.status === 'locked').length;

        res.status(200).json({
            exam_title: exam.title,
            stats: {
                total: totalSessions,
                ongoing: ongoingCount,
                locked: lockedCount
            },
            sessions: sessions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// them sinh vien vao ki thi 
export const addStudentToExam = async (req, res) => {
    try{
        const examId = req.params.id;
        const { studentId } = req.body;
        
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Không tìm thấy bài thi' });
        if (req.user.role !== 'teacher' || exam.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền thêm sinh viên vào kỳ thi này' });
        }
        
        // Kiểm tra xem studentId đã tồn tại trong allowed_students chưa
        if (exam.allowed_students.includes(studentId)) {
            return res.status(400).json({ message: 'Sinh viên đã được phép tham gia kỳ thi này' });
        }

        // Thêm studentId vào danh sách allowed_students
        exam.allowed_students.push(studentId);
        await exam.save();

        res.status(200).json({ message: 'Sinh viên đã được thêm vào kỳ thi' });

    }
    catch(error) {
        res.status(500).json({ message: error.message });
    }
}


// delete Exam and Session cua Exam 
export const deleteExamAndSessions = async (req, res) => {
    try {
        const examId = req.params.id;
        
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Không tìm thấy bài thi' });
        if (req.user.role !== 'teacher' || exam.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa kỳ thi này' });
        }
        
        // Xóa tất cả phiên thi liên quan đến kỳ thi này
        await ExamSession.deleteMany({ exam_id: examId });
        // Xóa kỳ thi
        await exam.deleteOne();
        
        res.status(200).json({ message: 'Kỳ thi và tất cả phiên thi liên quan đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

