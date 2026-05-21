import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);
        
        setIsLoading(false);

        if (result.success) {
            // Chuyển hướng dựa trên vai trò (Role)
            if (result.role === 'teacher' || result.role === 'admin') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } else {
            setError(result.message);
        }
    };

    // --- Inline CSS for Modern Design ---
    const styles = {
        pageContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Inter', sans-serif"
        },
        loginCard: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '40px 30px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            textAlign: 'center'
        },
        title: {
            margin: '0 0 20px',
            color: '#333',
            fontSize: '28px',
            fontWeight: '700'
        },
        subtitle: {
            color: '#666',
            marginBottom: '30px',
            fontSize: '14px'
        },
        inputGroup: {
            marginBottom: '20px',
            textAlign: 'left'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: '#555',
            fontWeight: '500',
            fontSize: '14px'
        },
        input: {
            width: '100%',
            padding: '12px 15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            boxSizing: 'border-box'
        },
        button: {
            width: '100%',
            padding: '14px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            marginTop: '10px'
        },
        buttonDisabled: {
            backgroundColor: '#a0aec0',
            cursor: 'not-allowed'
        },
        errorMsg: {
            color: '#e53e3e',
            backgroundColor: '#fff5f5',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #feb2b2'
        },
        linkText: { marginTop: '20px', fontSize: '14px', color: '#666' }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.loginCard}>
                <h2 style={styles.title}>Đăng Nhập</h2>
                <p style={styles.subtitle}>Hệ thống thi trực tuyến có giám sát</p>
                
                {error && <div style={styles.errorMsg}>{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tên đăng nhập</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Nhập username của bạn"
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Nhập mật khẩu"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
                
                <div style={styles.linkText}>
                    Chưa có tài khoản? <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;