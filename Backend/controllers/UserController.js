import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', 
    });
};

// Đăng ký người dùng mới
export const registerUser = async (req, res) => {
    try {
        const { username, password, role, full_name } = req.body;
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ 
            username, 
            password: hashedPassword, 
            role, 
            full_name 
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                full_name: user.full_name,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Thong tin khong phu hop' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đăng nhập 
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.json({
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    full_name: user.full_name,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401).json({ message: 'Sai mật khẩu!' });
            }
        } else {
            res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin người dùng
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin người dùng
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (req.user.role === 'student' && req.user._id.toString() !== user._id.toString()) {
                return res.status(403).json({ message: 'Lỗi bảo mật: Bạn không có quyền sửa thông tin của người khác!' });
            }
            user.full_name = req.body.full_name || user.full_name;
            
            if (req.user.role === 'teacher' || req.user.role === 'admin') {
                user.role = req.body.role || user.role;
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                full_name: updatedUser.full_name,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa người dùng
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
