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

        if (!username || !password || !full_name) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên' });
        }

        if (username.trim().length < 3) {
            return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 3 ký tự' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }

        const userExists = await User.findOne({ username: username.trim() });
        if (userExists) {
            return res.status(400).json({ message: 'Tài khoản đã tồn tại trên hệ thống' });
        }

        // Chặn nâng quyền: Chỉ cho phép gán role 'teacher' hoặc 'admin' nếu người thực hiện request là Admin đã đăng nhập.
        // Ngược lại đăng ký công khai chỉ được gán role 'student'.
        let assignedRole = 'student';
        if (req.user && req.user.role === 'admin' && role) {
            assignedRole = ['student', 'teacher', 'admin'].includes(role) ? role : 'student';
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ 
            username: username.trim(), // trim() để loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi
            password: hashedPassword, 
            role: assignedRole, 
            full_name: full_name.trim() 
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
            res.status(400).json({ message: 'Thông tin không phù hợp' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đăng nhập 
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' });
        }

        const user = await User.findOne({ username: username.trim() });

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

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const isSelf = req.user._id.toString() === user._id.toString();
        const isAdmin = req.user.role === 'admin';

        // Không phải chính mình và cũng không phải Admin -> Chặn
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ message: 'Lỗi bảo mật: Bạn không có quyền sửa thông tin của người dùng khác!' });
        }

        user.full_name = req.body.full_name ? req.body.full_name.trim() : user.full_name;
        
        // Chỉ Admin mới được thay đổi role của tài khoản
        if (isAdmin && req.body.role) {
            if (['student', 'teacher', 'admin'].includes(req.body.role)) {
                user.role = req.body.role;
            }
        }

        if (req.body.password) {
            if (req.body.password.length <  8) {
                return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
            }
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa người dùng (Chỉ Admin mới có quyền)
export const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Lỗi bảo mật: Chỉ Admin mới có quyền xóa tài khoản!' });
        }

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
