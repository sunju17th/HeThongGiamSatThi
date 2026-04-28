import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'student' // Mặc định đăng ký là student
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/users/register', {
                username: formData.username,
                password: formData.password,
                full_name: formData.full_name,
                role: formData.role
            });
            
            alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi đăng ký tài khoản');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Inline CSS for Modern Design ---
    const styles = {
        pageContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Inter', sans-serif",
            padding: '20px',
            boxSizing: 'border-box'
        },
        loginCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '40px 30px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            textAlign: 'center'
        },
        title: { margin: '0 0 10px', color: '#333', fontSize: '28px', fontWeight: '700' },
        subtitle: { color: '#666', marginBottom: '30px', fontSize: '14px' },
        inputGroup: { marginBottom: '15px', textAlign: 'left' },
        label: { display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500', fontSize: '14px' },
        input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', transition: 'border-color 0.3s ease', boxSizing: 'border-box' },
        button: { width: '100%', padding: '14px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s ease', marginTop: '10px' },
        buttonDisabled: { backgroundColor: '#a0aec0', cursor: 'not-allowed' },
        errorMsg: { color: '#e53e3e', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #feb2b2' },
        linkText: { marginTop: '20px', fontSize: '14px', color: '#666' }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.loginCard}>
                <h2 style={styles.title}>Đăng Ký Tài Khoản</h2>
                <p style={styles.subtitle}>Tạo tài khoản để tham gia hệ thống thi trực tuyến</p>
                
                {error && <div style={styles.errorMsg}>{error}</div>}
                
                <form onSubmit={handleRegister}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Họ và tên</label>
                        <input 
                            type="text" 
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Nhập họ và tên của bạn"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tên đăng nhập</label>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Tạo username"
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Tạo mật khẩu"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Xác nhận mật khẩu</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang tạo...' : 'Đăng Ký'}
                    </button>
                </form>

                <div style={styles.linkText}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
