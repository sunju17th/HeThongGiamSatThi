// frontend/src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Nhà cung cấp dữ liệu)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra xem người dùng đã đăng nhập từ trước chưa (khi tải lại trang)
    useEffect(() => {
        const userInfo = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userInfo && token) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    // Hàm xử lý đăng nhập
    const login = async (username, password) => {
        try {
            const response = await api.post('/users/login', { username, password });
            const data = response.data;

            // Lưu vào kho chung
            setUser(data);
            // Lưu vào LocalStorage để không bị mất khi F5 tải lại trang
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            
            return { success: true, role: data.role };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Lỗi đăng nhập' 
            };
        }
    };

    // Hàm xử lý đăng xuất
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Tạo Hook tùy chỉnh để dễ sử dụng
export const useAuth = () => {
    return useContext(AuthContext);
};