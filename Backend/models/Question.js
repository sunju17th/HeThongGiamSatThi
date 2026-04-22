import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung câu hỏi']
    },
    options: {
        type: [String],
        required: [true, 'Vui lòng cung cấp các lựa chọn đáp án'],
        validate: [arrayLimit, 'Cần ít nhất 2 lựa chọn']
    },
    correct_answer: {
        type: String,
        required: [true, 'Vui lòng nhập đáp án đúng']
    },
    points: {
        type: Number,
        required: true,
        default: 1
    }
}, { timestamps: true });

// Hàm validate
function arrayLimit(val) {
    return val.length >= 2;
}

const Question = mongoose.model('Question', questionSchema);
export default Question;
