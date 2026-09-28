import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentPortal = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await api.get('/exams');
                setExams(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải danh sách kỳ thi:", err);
                setError("Không thể tải danh sách kỳ thi. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    const handleEnterExam = (examId) => {
        navigate(`/exam/${examId}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Modern CSS ---
    const styles = {
        page: {
            minHeight: '100vh',
            background: '#f0f2f5',
            fontFamily: "'Inter', sans-serif"
        },
        navbar: {
            background: 'white',
            padding: '15px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        },
        logo: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#38a169',
            margin: 0,
            cursor: 'pointer'
        },
        navLinks: {
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
        },
        linkBtn: {
            background: 'none',
            border: 'none',
            color: '#4a5568',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px'
        },
        logoutBtn: {
            padding: '8px 20px',
            backgroundColor: '#fff',
            color: '#e53e3e',
            border: '1px solid #e53e3e',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
        },
        mainContent: {
            maxWidth: '1100px',
            margin: '40px auto',
            padding: '0 20px'
        },
        headerRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
        },
        pageTitle: {
            fontSize: '28px',
            color: '#2d3748',
            margin: 0,
            fontWeight: '700'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '25px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid #edf2f7',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        cardTitle: {
            margin: '0 0 15px 0',
            fontSize: '18px',
            color: '#2d3748',
            fontWeight: '600',
            borderBottom: '1px solid #edf2f7',
            paddingBottom: '12px'
        },
        cardDetail: {
            margin: '8px 0',
            fontSize: '14px',
            color: '#718096',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        strong: {
            color: '#4a5568'
        },
        enterBtn: {
            padding: '12px',
            backgroundColor: '#38a169',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            marginTop: '20px',
            width: '100%',
            transition: 'background-color 0.2s, transform 0.2s'
        },
        errorState: {
            textAlign: 'center',
            padding: '20px',
            background: '#fff5f5',
            color: '#c53030',
            borderRadius: '8px',
            border: '1px solid #fed7d7'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px dashed #cbd5e0',
            color: '#a0aec0',
            gridColumn: '1 / -1' // Span full width
        }
    };

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <h1 style={styles.logo} onClick={() => navigate('/student')}>Proctor<span style={{ color: '#a0aec0' }}>Student</span></h1>
                <div style={styles.navLinks}>
                    <button style={{...styles.linkBtn, color: '#38a169', borderBottom: '2px solid #38a169'}}>Kỳ thi của tôi</button>
                    <button style={styles.linkBtn} onClick={() => navigate('/student/history')}>Lịch sử thi</button>
                    <span style={{ color: '#cbd5e0' }}>|</span>
                    <button 
                        style={styles.logoutBtn}
                        onClick={handleLogout}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff5f5'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
                    >
                        Đăng xuất
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={styles.mainContent}>
                <div style={styles.headerRow}>
                    <h2 style={styles.pageTitle}>Kỳ thi của tôi</h2>
                </div>

                {error && <div style={styles.errorState}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>
                        Đang tải danh sách kỳ thi...
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {!error && exams.length === 0 && (
                            <div style={styles.emptyState}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#4a5568' }}>Không có kỳ thi nào</h3>
                                <p style={{ margin: 0 }}>Hiện tại bạn chưa được phân công hoặc không có kỳ thi nào đang mở.</p>
                            </div>
                        )}

                        {!error && exams.map((exam) => {
                            const now = new Date();
                            const startTime = exam.start_time ? new Date(exam.start_time) : null;
                            const endTime = exam.end_time ? new Date(exam.end_time) : null;

                            let statusBadge = null;
                            let canJoin = true;
                            let statusText = "Vào Thi Ngay";

                            if (startTime && now < startTime) {
                                statusBadge = <span style={{ padding: '4px 10px', background: '#fefcbf', color: '#744210', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>⏳ Chưa mở</span>;
                                canJoin = false;
                                statusText = "Chưa Đến Giờ Thi";
                            } else if (endTime && now > endTime) {
                                statusBadge = <span style={{ padding: '4px 10px', background: '#fed7d7', color: '#9b2c2c', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>🔴 Đã kết thúc</span>;
                                canJoin = false;
                                statusText = "Đã Hết Giờ Thi";
                            } else {
                                statusBadge = <span style={{ padding: '4px 10px', background: '#c6f6d5', color: '#22543d', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>🟢 Đang mở</span>;
                                canJoin = true;
                            }

                            return (
                                <div 
                                    key={exam._id} 
                                    style={styles.card}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.08)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <h4 style={{ ...styles.cardTitle, borderBottom: 'none', paddingBottom: 0, margin: 0 }}>{exam.title || 'Bài thi không tên'}</h4>
                                            {statusBadge}
                                        </div>
                                        <p style={styles.cardDetail}>
                                            <span role="img" aria-label="time">⏳</span> 
                                            Thời lượng: <strong style={styles.strong}>{exam.duration_minutes || 60} phút</strong>
                                        </p>
                                        <p style={styles.cardDetail}>
                                            <span role="img" aria-label="start">📅</span> 
                                            Bắt đầu: <strong style={styles.strong}>{startTime ? startTime.toLocaleString('vi-VN') : 'N/A'}</strong>
                                        </p>
                                        <p style={styles.cardDetail}>
                                            <span role="img" aria-label="end">🏁</span> 
                                            Kết thúc: <strong style={styles.strong}>{endTime ? endTime.toLocaleString('vi-VN') : 'N/A'}</strong>
                                        </p>
                                        <p style={styles.cardDetail}>
                                            <span role="img" aria-label="alert">⚠️</span> 
                                            Cho phép vi phạm: <strong style={styles.strong}>{exam.max_violations ?? 3} lần</strong>
                                        </p>
                                    </div>
                                    <button 
                                        style={{
                                            ...styles.enterBtn,
                                            backgroundColor: canJoin ? '#38a169' : '#a0aec0',
                                            cursor: canJoin ? 'pointer' : 'not-allowed'
                                        }} 
                                        onClick={() => canJoin && handleEnterExam(exam._id)}
                                        disabled={!canJoin}
                                        onMouseOver={(e) => { if (canJoin) e.currentTarget.style.backgroundColor = '#2f855a'; }}
                                        onMouseOut={(e) => { if (canJoin) e.currentTarget.style.backgroundColor = '#38a169'; }}
                                    >
                                        {statusText}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentPortal;
