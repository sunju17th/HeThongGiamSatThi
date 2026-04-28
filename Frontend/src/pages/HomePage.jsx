import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
        if (!user) {
            navigate('/login');
        } else {
            // Đã đăng nhập thì cho vào thẳng Dashboard tương ứng
            if (user.role === 'teacher' || user.role === 'admin') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        },
        hero: {
            maxWidth: '800px',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '60px 40px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
        },
        title: {
            fontSize: '48px',
            fontWeight: '800',
            color: '#2d3748',
            marginBottom: '20px',
            lineHeight: '1.2'
        },
        subtitle: {
            fontSize: '18px',
            color: '#4a5568',
            marginBottom: '40px',
            lineHeight: '1.6'
        },
        button: {
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#4c51bf',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 14px 0 rgba(76, 81, 191, 0.39)'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 style={styles.title}>Hệ Thống Giám Sát <br />Thi Trực Tuyến</h1>
                <p style={styles.subtitle}>
                    Nền tảng thi trực tuyến an toàn, minh bạch với công nghệ giám sát thông minh, 
                    đảm bảo tính công bằng cho mọi kỳ thi của bạn.
                </p>
                <button 
                    style={styles.button} 
                    onClick={handleGetStarted}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {user ? 'Vào Bảng Điều Khiển' : 'Bắt Đầu Ngay'}
                </button>
            </div>
        </div>
    );
};

export default HomePage;
