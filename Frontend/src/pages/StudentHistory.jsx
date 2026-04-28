import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentHistory = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Theo thiết kế Backend, GET /api/sessions của Student sẽ tự động lấy các session của chính Student đó
                const response = await api.get('/sessions');
                
                // Sắp xếp bài thi nộp gần nhất lên đầu
                const sortedHistory = response.data.sort((a, b) => {
                    const timeA = new Date(a.submit_time || a.start_time).getTime();
                    const timeB = new Date(b.submit_time || b.start_time).getTime();
                    return timeB - timeA;
                });

                setHistory(sortedHistory);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải lịch sử:", err);
                setError("Không thể tải lịch sử bài thi. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- CSS ---
    const styles = {
        page: { minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Inter', sans-serif" },
        navbar: { background: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
        logo: { fontSize: '20px', fontWeight: 'bold', color: '#38a169', margin: 0, cursor: 'pointer' },
        navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
        linkBtn: { background: 'none', border: 'none', color: '#4a5568', fontWeight: '600', cursor: 'pointer', fontSize: '15px' },
        logoutBtn: { padding: '8px 20px', backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
        mainContent: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
        headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        pageTitle: { fontSize: '28px', color: '#2d3748', margin: 0, fontWeight: '700' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' },
        card: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'transform 0.2s' },
        cardHeader: { borderBottom: '1px solid #edf2f7', paddingBottom: '15px' },
        cardTitle: { margin: '0 0 10px 0', fontSize: '20px', color: '#2d3748', fontWeight: '700' },
        detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#718096' },
        strong: { color: '#4a5568', fontWeight: '600' },
        scoreBox: { background: '#f0fff4', border: '1px solid #c6f6d5', padding: '15px', borderRadius: '8px', textAlign: 'center' },
        scoreValue: { fontSize: '28px', fontWeight: 'bold', color: '#38a169', margin: '5px 0 0 0' },
        scoreLocked: { background: '#fff5f5', border: '1px solid #fed7d7', padding: '15px', borderRadius: '8px', textAlign: 'center' },
        scoreLockedValue: { fontSize: '24px', fontWeight: 'bold', color: '#e53e3e', margin: '5px 0 0 0' },
        badgeLocked: { display: 'inline-block', background: '#fed7d7', color: '#c53030', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        badgeSubmitted: { display: 'inline-block', background: '#c6f6d5', color: '#22543d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        badgeOngoing: { display: 'inline-block', background: '#feebc8', color: '#975a16', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        emptyState: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e0', color: '#a0aec0', gridColumn: '1 / -1' }
    };

    const getStatusBadge = (status) => {
        if (status === 'locked') return <span style={styles.badgeLocked}>BỊ KHÓA GIAN LẬN</span>;
        if (status === 'submitted') return <span style={styles.badgeSubmitted}>Đã nộp bài</span>;
        if (status === 'ongoing') return <span style={styles.badgeOngoing}>Đang làm bài (Bị gián đoạn)</span>;
        return <span>{status}</span>;
    };

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <h1 style={styles.logo} onClick={() => navigate('/student')}>Proctor<span style={{ color: '#a0aec0' }}>Student</span></h1>
                <div style={styles.navLinks}>
                    <button style={styles.linkBtn} onClick={() => navigate('/student')}>Kỳ thi của tôi</button>
                    <button style={{...styles.linkBtn, color: '#38a169', borderBottom: '2px solid #38a169'}} >Lịch sử thi</button>
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
                    <h2 style={styles.pageTitle}>Lịch Sử Bài Thi</h2>
                </div>

                {error && <div style={{ color: '#c53030', padding: '15px', background: '#fff5f5', borderRadius: '8px' }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>Đang tải dữ liệu lịch sử...</div>
                ) : (
                    <div style={styles.grid}>
                        {!error && history.length === 0 && (
                            <div style={styles.emptyState}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#4a5568' }}>Bạn chưa hoàn thành bài thi nào</h3>
                                <p style={{ margin: 0 }}>Kết quả thi của bạn sẽ xuất hiện ở đây sau khi nộp bài.</p>
                            </div>
                        )}

                        {!error && history.map((session) => (
                            <div key={session._id} style={styles.card} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={styles.cardHeader}>
                                    <h4 style={styles.cardTitle}>{session.exam_id?.title || 'Bài thi không tên'}</h4>
                                    <div style={styles.detailRow}>
                                        <span>Trạng thái:</span>
                                        {getStatusBadge(session.status)}
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{...styles.detailRow, marginBottom: '8px'}}>
                                        <span>Thời gian nộp:</span>
                                        <span style={styles.strong}>{session.submit_time ? new Date(session.submit_time).toLocaleString('vi-VN') : '--'}</span>
                                    </div>
                                    <div style={styles.detailRow}>
                                        <span>Số lần vi phạm:</span>
                                        <span style={{ color: session.violation_count > 0 ? '#e53e3e' : '#38a169', fontWeight: 'bold' }}>
                                            {session.violation_count} lần
                                        </span>
                                    </div>
                                </div>

                                <div style={session.status === 'locked' ? styles.scoreLocked : styles.scoreBox}>
                                    <div style={{ fontSize: '14px', color: session.status === 'locked' ? '#c53030' : '#2f855a', fontWeight: '600' }}>
                                        {session.status === 'locked' ? 'HỦY KẾT QUẢ' : 'ĐIỂM SỐ'}
                                    </div>
                                    <p style={session.status === 'locked' ? styles.scoreLockedValue : styles.scoreValue}>
                                        {session.total_score !== undefined ? session.total_score : '--'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentHistory;
