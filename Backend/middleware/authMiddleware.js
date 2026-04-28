import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm user và gắn vào req.user (không trả về pass)
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
        }
    }

    return res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token' });
};

/* 
  Middleware kiểm tra quyền hạn (Role-based access control)
  
  Cú pháp (...roles) được gọi là "Rest parameter" trong JavaScript.
  Nó sẽ thu thập tất cả các đối số được truyền vào hàm và gom chúng lại thành 1 Mảng (Array).
  Ví dụ: Khi bạn gọi `authorize('teacher', 'admin')`, biến roles sẽ trở thành `['teacher', 'admin']`.
*/
export const authorize = (...roles) => {
    // Hàm này sẽ trả về một middleware thực sự cho Express (Kỹ thuật Closure của JS).
    return (req, res, next) => {
        
        // Đoạn này kiểm tra: role của user (req.user.role) có tồn tại trong cái mảng roles ở trên hay không.
        // req.user được tạo ra từ middleware "protect" chạy ngay trước đó.
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Tài khoản với vai trò '${req.user.role}' không có quyền truy cập vào chức năng này!` 
            });
        }

        // Nếu user có quyền nằm trong danh sách truyền vào => cho phép đi tiếp (vào Controller xử lý logic)
        next();
    };
};
