import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Import các Models của bạn (Sửa lại đường dẫn nếu file của bạn nằm chỗ khác)
import User from './models/User.js';
import Question from './models/Question.js';
import Exam from './models/Exam.js';
import ExamSession from './models/ExamSession.js';
import bcrypt from 'bcryptjs';

dotenv.config();

// Kết nối Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exam_db')
    .then(() => console.log('🟢 Đã kết nối MongoDB để Seed dữ liệu'))
    .catch(err => console.log('🔴 Lỗi kết nối:', err));

const importData = async () => {
    try {
        console.log('⏳ Đang xóa dữ liệu cũ...');
        // Xóa sạch dữ liệu cũ để tránh trùng lặp khi chạy lại lệnh
        await ExamSession.deleteMany();
        await Exam.deleteMany();
        await Question.deleteMany();
        await User.deleteMany();

        console.log('✅ Đã xóa xong! Bắt đầu tạo dữ liệu mới...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. TẠO USERS (3 Giáo viên, 30 Sinh viên)
        const usersToCreate = [];
        // Tạo 3 giáo viên
        for (let i = 1; i <= 3; i++) {
            usersToCreate.push({
                username: `teacher0${i}`,
                password: hashedPassword, 
                full_name: `Giảng viên ${i}`,
                role: 'teacher'
            });
        }
        // Tạo 30 sinh viên
        for (let i = 1; i <= 30; i++) {
            usersToCreate.push({
                username: `student${i < 10 ? '0' + i : i}`,
                password: hashedPassword,
                full_name: `Sinh viên Nguyễn Văn ${i}`,
                role: 'student'
            });
        }
        // Dùng create để kích hoạt hook mã hóa mật khẩu trong file Model
        const createdUsers = await User.create(usersToCreate);
        const teachers = createdUsers.filter(u => u.role === 'teacher');
        const students = createdUsers.filter(u => u.role === 'student');


        // 2. TẠO CÂU HỎI (100 Câu)
        const questionsToCreate = [];
        const optionsSample = ['A', 'B', 'C', 'D'];
        for (let i = 1; i <= 100; i++) {
            questionsToCreate.push({
                content: `Câu hỏi trắc nghiệm số ${i}. Đặc điểm nào sau đây là đúng?`,
                options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
                correct_answer: `Đáp án ${optionsSample[Math.floor(Math.random() * optionsSample.length)]}`,
                points: 1
            });
        }
        const createdQuestions = await Question.insertMany(questionsToCreate);


        // 3. TẠO BÀI THI (5 Bài thi)
        const examsToCreate = [];
        for (let i = 1; i <= 5; i++) {
            // Lấy ngẫu nhiên 20 câu hỏi cho mỗi đề
            const shuffledQuestions = [...createdQuestions].sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffledQuestions.slice(0, 20).map(q => q._id);
            
            // Lấy ngẫu nhiên 15-25 sinh viên được phép thi
            const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
            const allowedStudents = shuffledStudents.slice(0, Math.floor(Math.random() * 10) + 15).map(s => s._id);

            examsToCreate.push({
                title: `Bài thi cuối kỳ môn IT số ${i}`,
                duration_minutes: 60,
                start_time: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hôm qua
                end_time: new Date(Date.now() + 24 * 60 * 60 * 1000),   // Ngày mai
                max_violations: 3,
                teacher_id: teachers[Math.floor(Math.random() * teachers.length)]._id,
                questions: selectedQuestions,
                allowed_students: allowedStudents
            });
        }
        const createdExams = await Exam.insertMany(examsToCreate);


        // 4. TẠO PHIÊN THI (EXAM SESSIONS) - Giả lập sinh viên đã làm bài
        const sessionsToCreate = [];
        const logTypes = ['tab_switch', 'window_blur', 'reconnected'];

        for (const exam of createdExams) {
            // Mỗi bài thi, cho khoảng 80% số sinh viên trong danh sách nộp bài
            for (const studentId of exam.allowed_students) {
                // Tỉ lệ 80% sinh viên làm bài
                if (Math.random() > 0.2) { 
                    // Tạo ngẫu nhiên câu trả lời
                    const answers = exam.questions.map(qId => ({
                        question_id: qId,
                        selected_option: `Đáp án ${optionsSample[Math.floor(Math.random() * optionsSample.length)]}`
                    }));

                    // Tạo ngẫu nhiên log vi phạm (0 đến 4 lỗi)
                    const proctoring_logs = [];
                    const violationCount = Math.floor(Math.random() * 5);
                    for(let v = 0; v < violationCount; v++) {
                        proctoring_logs.push({
                            event_type: logTypes[Math.floor(Math.random() * logTypes.length)],
                            timestamp: new Date(),
                            description: 'Hệ thống tự động ghi nhận vi phạm'
                        });
                    }

                    sessionsToCreate.push({
                        exam_id: exam._id,
                        student_id: studentId,
                        start_time: new Date(Date.now() - 60 * 60 * 1000),
                        submit_time: new Date(),
                        status: 'submitted',
                        total_score: Math.floor(Math.random() * 20), // Giả lập điểm từ 0 đến 20
                        violation_count: proctoring_logs.length,
                        proctoring_logs: proctoring_logs,
                        answers: answers
                    });
                }
            }
        }
        await ExamSession.insertMany(sessionsToCreate);

        console.log(`🎉 Thành công! Đã thêm:`);
        console.log(`- ${createdUsers.length} Users`);
        console.log(`- ${createdQuestions.length} Questions`);
        console.log(`- ${createdExams.length} Exams`);
        console.log(`- ${sessionsToCreate.length} Exam Sessions`);
        
        process.exit();
    } catch (error) {
        console.error('🔴 Lỗi khi import dữ liệu:', error);
        process.exit(1);
    }
};

importData();