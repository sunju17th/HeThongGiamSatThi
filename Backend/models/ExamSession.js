import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    selected_option: {
        type: String,
    },
    is_correct: {
        type: Boolean,
        default: false,
    }
}, { _id: false });

const proctoringLogSchema = new mongoose.Schema({
    event_type: {
        type: String,
        enum: ['tab_switch', 'window_blur', 'reconnected'], 
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
    }
}, { _id: false });

const examSessionSchema = new mongoose.Schema({
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    start_time: {
        type: Date,
        default: Date.now,
    },
    submit_time: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['ongoing', 'submitted', 'locked'],
        default: 'ongoing',
    },
    total_score: {
        type: Number,
        default: 0,
    },
    answers: [answerSchema],
    proctoring_logs: [proctoringLogSchema],
    violation_count: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const ExamSession = mongoose.model('ExamSession', examSessionSchema);
export default ExamSession;
