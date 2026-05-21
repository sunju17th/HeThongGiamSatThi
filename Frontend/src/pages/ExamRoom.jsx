import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ExamRoom = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    
    // Lưu các câu trả lời dưới dạng { questionId: "A" }
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const hasJoinedRef = useRef(false);

    // Bắt đầu vào thi
    useEffect(() => {
        if (hasJoinedRef.current) return;
        hasJoinedRef.current = true;

        const initExam = async () => {
            try {
                // 1. Gọi API join để tạo/lấy session
                const joinRes = await api.post(`/exams/${examId}/join`);
                const sessionData = joinRes.data;
                setSession(sessionData);

                // 2. Gọi API get exam để lấy chi tiết đề thi và câu hỏi
                const examRes = await api.get(`/exams/${examId}`);
                const examData = examRes.data;
                setExam(examData);
                setQuestions(examData.questions || []);
                
                // 3. Khởi tạo thời gian còn lại (tính bằng giây)
                const durationSeconds = (examData.duration_minutes * 60) || 3600;
                
                // Tính toán thời gian đã trôi qua nếu reconnect
                const startTime = new Date(sessionData.start_time);
                const now = new Date();
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                
                let remaining = durationSeconds - elapsedSeconds;
                if (remaining <= 0) remaining = 0;

                setTimeLeft(remaining);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tham gia kỳ thi:", err);
                setError(err.response?.data?.message || err.message || "Không thể vào phòng thi. Có thể bạn đã thi hoặc lỗi máy chủ.");
                setLoading(false);
            }
        };

        initExam();
    }, [examId]);

    // Đồng hồ đếm ngược nội bộ
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || !session) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleSubmit(); // Hết giờ thì tự động nộp bài
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, session]);

    // Nộp bài
    const handleSubmit = useCallback(async () => {
        if (!session) return;
        
        try {
            // Chuẩn bị payload: có thể backend yêu cầu mảng { questionId, selectedOption } hoặc một object
            // Chuẩn bị payload khớp với backend: [{ question_id, selected_option }]
            const formattedAnswers = Object.keys(answers).map(qId => ({
                question_id: qId,
                selected_option: answers[qId]
            }));

            const response = await api.post(`/sessions/${session._id}/submit`, {
                answers: formattedAnswers
            });
            
            alert(`Nộp bài thành công!`);
            navigate(`/student/exam-result/${session._id}`);
        } catch (err) {
            console.error("Lỗi khi nộp bài:", err);
            alert("Đã xảy ra lỗi khi nộp bài vui lòng báo cáo với giám thị!");
            navigate('/student');
        }
    }, [answers, session, navigate]);

    // Xử lý giám sát (Proctoring - Nhiệm vụ 3)
    useEffect(() => {
        if (!session) return;

        const handleViolation = async (violationType) => {
            console.warn(`Phát hiện vi phạm: ${violationType}`);
            try {
                const response = await api.post(`/sessions/${session._id}/logs`, {
                    type: violationType,
                    description: `Phát hiện hành vi ${violationType}`
                });

                // Nếu backend gài isLocked: true vì vi phạm quá nhiều lần
                if (response.data.isLocked) {
                    alert("Tài khoản của bạn đã bị khóa khỏi bài thi do vi phạm quy chế quá nhiều lần!");
                    navigate(`/student/exam-result/${session._id}`);
                } else {
                    alert(`CẢNH BÁO VI PHẠM: Giám thị đã ghi nhận bạn rời khỏi màn hình thi!`);
                }
            } catch (err) {
                console.error("Lỗi khi gửi log vi phạm:", err);
            }
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                handleViolation('tab_switch');
            }
        };

        const onWindowBlur = () => {
             handleViolation('window_blur');
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("blur", onWindowBlur);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", onWindowBlur);
        };
    }, [session, navigate]);

    // Helpers format thời gian
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSelectOption = (questionId, option) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    // --- Modern CSS ---
    const styles = {
        page: { minHeight: '100vh', backgroundColor: '#1a202c', padding: '20px 0', fontFamily: "'Inter', sans-serif" },
        container: { maxWidth: '800px', margin: '0 auto', padding: '0 20px' },
        header: { position: 'sticky', top: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, marginBottom: '30px' },
        title: { margin: 0, fontSize: '24px', color: '#2d3748', fontWeight: 'bold' },
        subtitle: { margin: '5px 0 0 0', color: '#718096', fontSize: '14px' },
        timerBox: { display: 'flex', alignItems: 'center', gap: '10px', background: timeLeft < 60 ? '#fff5f5' : '#ebf4ff', padding: '10px 20px', borderRadius: '8px', border: `1px solid ${timeLeft < 60 ? '#fed7d7' : '#bee3f8'}` },
        timer: { fontSize: '24px', fontWeight: 'bold', color: timeLeft < 60 ? '#e53e3e' : '#3182ce', fontFamily: 'monospace' },
        errorCard: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
        errorMsg: { color: '#e53e3e', fontSize: '20px', marginBottom: '20px' },
        questionCard: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.2s' },
        questionTitle: { margin: '0 0 20px 0', fontSize: '18px', color: '#2d3748', lineHeight: '1.5', fontWeight: '600' },
        optionsGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
        optionLabel: { display: 'flex', alignItems: 'center', padding: '16px 20px', border: '2px solid #edf2f7', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: '#f8fafc', color: '#4a5568', fontWeight: '500' },
        selectedOption: { display: 'flex', alignItems: 'center', padding: '16px 20px', border: '2px solid #4299e1', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: '#ebf8ff', color: '#2b6cb0', fontWeight: 'bold' },
        radioInput: { width: '18px', height: '18px', marginRight: '15px', cursor: 'pointer', accentColor: '#4299e1' },
        submitBtn: { padding: '16px 40px', backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'block', margin: '40px auto 20px', boxShadow: '0 4px 15px rgba(66, 153, 225, 0.4)', transition: 'all 0.2s' }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: 'white', fontFamily: "'Inter', sans-serif" }}>Đang khởi tạo phòng thi...</div>;
    
    if (error) return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.errorCard}>
                    <h2 style={styles.errorMsg}>{error}</h2>
                    <button style={styles.submitBtn} onClick={() => navigate('/student')}>Quay lại Bảng điều khiển</button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>{exam?.title || 'Bài thi'}</h2>
                        <p style={styles.subtitle}>Sinh viên: <strong>{user?.full_name || user?.username}</strong></p>
                    </div>
                    <div style={styles.timerBox}>
                        <span style={{ fontSize: '20px' }}>⏳</span>
                        <div style={styles.timer}>{formatTime(timeLeft)}</div>
                    </div>
                </div>

                <div>
                    {questions && questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div key={q._id} style={styles.questionCard}>
                                <h4 style={styles.questionTitle}>Câu {index + 1}: {q.content || q.text}</h4>
                                <div style={styles.optionsGrid}>
                                    {q.options && q.options.map((opt, i) => {
                                        const isSelected = answers[q._id] === opt;
                                        return (
                                            <label 
                                                key={i} 
                                                style={isSelected ? styles.selectedOption : styles.optionLabel}
                                                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e0'; }}
                                                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.borderColor = '#edf2f7'; }}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name={`question-${q._id}`} 
                                                    value={opt}
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOption(q._id, opt)}
                                                    style={styles.radioInput}
                                                />
                                                {String.fromCharCode(65 + i)}. {opt}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.errorCard}>
                            <p style={{ color: '#718096' }}>Không có dữ liệu câu hỏi.</p>
                        </div>
                    )}

                    <button 
                        style={styles.submitBtn} 
                        onClick={handleSubmit}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Nộp Bài Ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamRoom;
