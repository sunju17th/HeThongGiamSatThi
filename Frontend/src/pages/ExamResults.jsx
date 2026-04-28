import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ExamResults = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho Modal xem chi tiết log
    const [selectedSession, setSelectedSession] = useState(null);
    const [loadingLogs, setLoadingLogs] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get(`/exams/${examId}/sessions`);
                
                // Sắp xếp: Điểm cao xếp trên, bị khóa (locked) xếp dưới cùng
                if (response.data && response.data.sessions) {
                    response.data.sessions.sort((a, b) => {
                        if (a.status === 'locked' && b.status !== 'locked') return 1;
                        if (b.status === 'locked' && a.status !== 'locked') return -1;
                        
                        // Cùng trạng thái thì xét điểm (điểm cao hơn xếp trước)
                        const scoreA = a.total_score || 0;
                        const scoreB = b.total_score || 0;
                        return scoreB - scoreA;
                    });
                }

                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tải kết quả:", err);
                setError("Không thể tải báo cáo kết quả thi. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchResults();
    }, [examId]);

    const handleViewLogs = async (sessionId) => {
        setLoadingLogs(true);
        try {
            const response = await api.get(`/sessions/${sessionId}`);
            setSelectedSession(response.data);
        } catch (err) {
            console.error("Lỗi tải chi tiết session:", err);
            alert("Không thể tải chi tiết phiên thi lúc này.");
        } finally {
            setLoadingLogs(false);
        }
    };

    const closeModal = () => setSelectedSession(null);

    // --- CSS Styles ---
    const styles = {
        page: { minHeight: '100vh', background: '#f0f2f5', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
        container: { maxWidth: '1200px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
        title: { margin: 0, color: '#2d3748', fontSize: '24px', fontWeight: '700' },
        btnBack: { padding: '10px 20px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
        statCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' },
        statValue: { fontSize: '32px', fontWeight: 'bold', color: '#4c51bf', margin: '10px 0 0 0' },
        tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '15px', textAlign: 'left', fontWeight: '600', color: '#4a5568', borderBottom: '2px solid #edf2f7' },
        td: { padding: '15px', borderBottom: '1px solid #edf2f7', color: '#2d3748' },
        btnLog: { padding: '6px 12px', background: '#ebf4ff', color: '#4c51bf', border: '1px solid #c3dafe', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' },
        badgeLocked: { background: '#fed7d7', color: '#c53030', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        badgeSubmitted: { background: '#c6f6d5', color: '#22543d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        badgeOngoing: { background: '#feebc8', color: '#975a16', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
        
        // Modal Styles
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', width: '100%', maxWidth: '700px', borderRadius: '12px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
        logItem: { padding: '12px', background: '#fff5f5', borderLeft: '4px solid #e53e3e', marginBottom: '10px', borderRadius: '0 4px 4px 0' },
        logTime: { fontSize: '12px', color: '#718096', marginBottom: '4px' }
    };

    const getStatusBadge = (status) => {
        if (status === 'locked') return <span style={styles.badgeLocked}>BỊ KHÓA GIAN LẬN</span>;
        if (status === 'submitted') return <span style={styles.badgeSubmitted}>Đã nộp bài</span>;
        if (status === 'ongoing') return <span style={styles.badgeOngoing}>Đang làm bài</span>;
        return <span>{status}</span>;
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang nạp báo cáo...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Báo cáo thi: {data?.exam_title}</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#718096' }}>Quản lý kết quả và phát hiện gian lận</p>
                    </div>
                    <button style={styles.btnBack} onClick={() => navigate('/teacher')}>← Quay lại Dashboard</button>
                </div>

                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ color: '#718096', fontWeight: '600' }}>Tổng số tham gia</div>
                        <p style={styles.statValue}>{data?.stats?.total || 0}</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ color: '#718096', fontWeight: '600' }}>Đang thi</div>
                        <p style={{ ...styles.statValue, color: '#dd6b20' }}>{data?.stats?.ongoing || 0}</p>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ color: '#718096', fontWeight: '600' }}>Vi phạm & Bị khóa</div>
                        <p style={{ ...styles.statValue, color: '#e53e3e' }}>{data?.stats?.locked || 0}</p>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Sinh viên</th>
                                <th style={styles.th}>Trạng thái</th>
                                <th style={styles.th}>Điểm số</th>
                                <th style={styles.th}>Số lần vi phạm</th>
                                <th style={styles.th}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.sessions?.map(session => (
                                <tr key={session._id}>
                                    <td style={styles.td}>
                                        <strong>{session.student_id?.full_name || 'N/A'}</strong>
                                        <br />
                                        <span style={{ fontSize: '13px', color: '#718096' }}>{session.student_id?.username}</span>
                                    </td>
                                    <td style={styles.td}>
                                        {getStatusBadge(session.status)}
                                    </td>
                                    <td style={styles.td}>
                                        <strong style={{ fontSize: '18px', color: session.total_score >= 50 ? '#38a169' : '#e53e3e' }}>
                                            {session.total_score !== undefined ? session.total_score : '--'}
                                        </strong>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{ color: session.violation_count > 0 ? '#e53e3e' : '#4a5568', fontWeight: 'bold' }}>
                                            {session.violation_count || 0} lần
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={styles.btnLog}
                                            onClick={() => handleViewLogs(session._id)}
                                        >
                                            {loadingLogs ? '...' : 'Xem Logs Giám Sát'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data?.sessions?.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                                        Chưa có sinh viên nào tham gia kỳ thi này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Xem Log Vi Phạm */}
                {selectedSession && (
                    <div style={styles.modalOverlay} onClick={closeModal}>
                        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3>Logs Giám Sát: {selectedSession.student_id?.full_name}</h3>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
                            </div>
                            
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <p style={{ margin: '0 0 10px 0' }}>Trạng thái: {getStatusBadge(selectedSession.status)}</p>
                                <p style={{ margin: '0 0 10px 0' }}>Điểm số đạt được: <strong>{selectedSession.total_score}</strong></p>
                                <p style={{ margin: 0 }}>Tổng số lần vi phạm ghi nhận: <strong>{selectedSession.violation_count}</strong></p>
                            </div>

                            <h4>Chi tiết hành vi</h4>
                            {selectedSession.proctoring_logs && selectedSession.proctoring_logs.length > 0 ? (
                                selectedSession.proctoring_logs.map((log, i) => (
                                    <div key={i} style={styles.logItem}>
                                        <div style={styles.logTime}>
                                            {new Date(log.timestamp).toLocaleString('vi-VN')}
                                        </div>
                                        <strong style={{ color: '#c53030' }}>Loại vi phạm: {log.event_type}</strong>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{log.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#38a169', fontStyle: 'italic', padding: '20px', background: '#f0fff4', borderRadius: '8px' }}>
                                    ✅ Sinh viên này chưa có hành vi vi phạm nào.
                                </p>
                            )}

                            <button onClick={closeModal} style={{ ...styles.btnBack, width: '100%', marginTop: '20px' }}>Đóng</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamResults;
