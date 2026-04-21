import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề kỳ thi'],
    },
    duration_minutes: {
        type: Number,
        required: [true, 'Vui lòng nhập thời gian làm bài (phút)'],
    },
    start_time: {
        type: Date,
        required: [true, 'Vui lòng nhập thời gian bắt đầu'],
    },
    end_time: {
        type: Date,
        required: [true, 'Vui lòng nhập thời gian kết thúc'],
    },
    max_violations: { 
        type: Number, 
        default: 3, // Mặc định cho phép 3 lần, quá 3 lần là khóa
        required: [true, 'Vui lòng cài đặt số lần vi phạm tối đa']
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    }],
    allowed_students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
