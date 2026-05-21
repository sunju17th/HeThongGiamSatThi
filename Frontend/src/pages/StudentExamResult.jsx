import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const StudentExamResult = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    
    const [session, setSession] = useState(null);
    const [examDetails, setExamDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // 1. Lấy thông tin session (chứa điểm số, danh sách câu trả lời)
                const sessionRes = await api.get(`/sessions/${sessionId}`);
                setSession(sessionRes.data);

                // 2. Lấy thông tin chi tiết đề thi để lấy nội dung câu hỏi
                if (sessionRes.data?.exam_id?._id) {
                    const examRes = await api.get(`/exams/${sessionRes.data.exam_id._id}`);
                    setExamDetails(examRes.data);
                }

                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi lấy kết quả:", err);
                setError("Không thể lấy kết quả bài thi lúc này.");
                setLoading(false);
            }
        };

        fetchResult();
    }, [sessionId]);

    // CSS Styling
    const styles = {
        page: { minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
        container: { maxWidth: '800px', margin: '0 auto' },
        headerCard: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' },
        title: { fontSize: '28px', color: '#2d3748', margin: '0 0 10px 0', fontWeight: 'bold' },
        subtitle: { color: '#718096', fontSize: '16px', margin: 0 },
        scoreCircle: { width: '150px', height: '150px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '30px auto', border: '8px solid', backgroundColor: '#f8fafc' },
        scoreText: { fontSize: '48px', fontWeight: 'bold', margin: 0 },
        scoreLabel: { fontSize: '16px', color: '#718096', fontWeight: '600' },
        detailsGrid: { display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' },
        detailItem: { textAlign: 'center' },
        detailValue: { fontSize: '20px', fontWeight: 'bold', color: '#2d3748' },
        detailLabel: { fontSize: '14px', color: '#718096' },
        answerCard: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '5px solid' },
        questionText: { fontSize: '16px', color: '#2d3748', fontWeight: '600', margin: '0 0 15px 0' },
        optionsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
        optionItem: { padding: '10px 15px', borderRadius: '8px', fontSize: '15px', border: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' },
        btnBack: { padding: '15px 30px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'block', margin: '40px auto 0', transition: 'background-color 0.2s' }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Inter', sans-serif" }}>Đang tổng hợp kết quả...</div>;
    
    if (error || !session) return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.headerCard}>
                    <h2 style={{ color: '#e53e3e' }}>{error || 'Không tìm thấy dữ liệu'}</h2>
                    <button style={styles.btnBack} onClick={() => navigate('/student')}>Về trang chủ</button>
                </div>
            </div>
        </div>
    );

    const isLocked = session.status === 'locked';
    const borderColor = isLocked ? '#e53e3e' : (session.total_score >= 50 ? '#38a169' : '#dd6b20');
    const scoreColor = isLocked ? '#e53e3e' : (session.total_score >= 50 ? '#2f855a' : '#c05621');

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Tổng quan kết quả */}
                <div style={styles.headerCard}>
                    <h2 style={styles.title}>Kết Quả Bài Thi</h2>
                    <p style={styles.subtitle}>{session.exam_id?.title}</p>
                    
                    <div style={{ ...styles.scoreCircle, borderColor: borderColor }}>
                        {isLocked ? (
                            <>
                                <h3 style={{ margin: 0, color: '#e53e3e', fontSize: '24px' }}>HỦY</h3>
                                <span style={{ color: '#e53e3e', fontSize: '14px', fontWeight: 'bold' }}>KẾT QUẢ</span>
                            </>
                        ) : (
                            <>
                                <p style={{ ...styles.scoreText, color: scoreColor }}>{session.total_score || 0}</p>
                                <span style={styles.scoreLabel}>Điểm</span>
                            </>
                        )}
                    </div>

                    {isLocked && (
                        <div style={{ background: '#fff5f5', color: '#c53030', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                            ⚠ Bài thi của bạn đã bị khóa do vi phạm quy chế quá số lần cho phép.
                        </div>
                    )}

                    <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                            <div style={{...styles.detailValue, color: session.violation_count > 0 ? '#e53e3e' : '#38a169'}}>
                                {session.violation_count}
                            </div>
                            <div style={styles.detailLabel}>Lần vi phạm</div>
                        </div>
                        <div style={styles.detailItem}>
                            <div style={{...styles.detailValue, color: '#3182ce'}}>
                                {session.answers?.filter(a => a.is_correct).length || 0} / {examDetails?.questions?.length || session.answers?.length || 0}
                            </div>
                            <div style={styles.detailLabel}>Câu đúng</div>
                        </div>
                    </div>
                </div>

                {/* Chi tiết từng câu hỏi */}
                {!isLocked && examDetails?.questions && (
                    <div>
                        <h3 style={{ color: '#2d3748', marginBottom: '20px' }}>Chi tiết bài làm</h3>
                        {examDetails.questions.map((q, index) => {
                            // Tìm câu trả lời của sinh viên cho câu hỏi này
                            const studentAns = session.answers?.find(a => a.question_id === q._id);
                            const isCorrect = studentAns?.is_correct;
                            const isUnanswered = !studentAns;

                            return (
                                <div key={q._id} style={{ ...styles.answerCard, borderLeftColor: isUnanswered ? '#cbd5e0' : (isCorrect ? '#48bb78' : '#f56565') }}>
                                    <h4 style={styles.questionText}>
                                        Câu {index + 1}: {q.content}
                                        <span style={{ float: 'right', fontSize: '14px', color: isUnanswered ? '#a0aec0' : (isCorrect ? '#38a169' : '#e53e3e') }}>
                                            {isUnanswered ? 'Chưa trả lời' : (isCorrect ? '+ Điểm' : 'Sai')}
                                        </span>
                                    </h4>
                                    
                                    <div style={styles.optionsList}>
                                        {q.options.map((opt, i) => {
                                            const isStudentChoice = studentAns?.selected_option === opt;
                                            const isActuallyCorrect = q.correct_answer === opt;
                                            
                                            let bg = 'white';
                                            let border = '1px solid #edf2f7';
                                            let icon = '';

                                            if (isActuallyCorrect) {
                                                bg = '#f0fff4';
                                                border = '1px solid #9ae6b4';
                                                icon = '✓';
                                            } else if (isStudentChoice && !isActuallyCorrect) {
                                                bg = '#fff5f5';
                                                border = '1px solid #feb2b2';
                                                icon = '✗';
                                            }

                                            return (
                                                <div key={i} style={{ ...styles.optionItem, backgroundColor: bg, border: border }}>
                                                    <span>{String.fromCharCode(65 + i)}. {opt} {isStudentChoice && <strong>(Bạn chọn)</strong>}</span>
                                                    {icon && <strong style={{ color: isActuallyCorrect ? '#38a169' : '#e53e3e' }}>{icon}</strong>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button 
                    style={styles.btnBack} 
                    onClick={() => navigate('/student')}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2b6cb0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                >
                    Về Trang Chủ Sinh Viên
                </button>
            </div>
        </div>
    );
};

export default StudentExamResult;
