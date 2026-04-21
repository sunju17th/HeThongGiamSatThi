import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Vui lòng nhập tên đăng nhập'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'teacher'],
        default: 'student',
    },
    full_name: {
        type: String,
        required: [true, 'Vui lòng nhập họ và tên'],
    }
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
export default User;
