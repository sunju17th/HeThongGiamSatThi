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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasJoinedRef = useRef(false);
    const lastViolationTimeRef = useRef(0);
    const endTimeRef = useRef(null);

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
                
                // 3. Khởi tạo thời gian còn lại chuẩn xác theo server/start_time
                const durationSeconds = (examData.duration_minutes * 60) || 3600;
                const startTime = new Date(sessionData.start_time).getTime();
                const calculatedEndTime = startTime + (durationSeconds * 1000);
                endTimeRef.current = calculatedEndTime;
                
                const now = Date.now();
                let remaining = Math.max(0, Math.floor((calculatedEndTime - now) / 1000));
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

    // Đồng hồ đếm ngược dựa trên thời gian thực
    useEffect(() => {
        if (timeLeft === null || !session || !endTimeRef.current) return;

        const timerId = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerId);
                executeSubmit(); // Hết giờ tự động nộp bài
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [session]);

    // Thực thi nộp bài
    const executeSubmit = useCallback(async () => {
        if (!session || isSubmitting) return;
        setIsSubmitting(true);
        
        try {
            const formattedAnswers = Object.keys(answers).map(qId => ({
                question_id: qId,
                selected_option: answers[qId]
            }));

            await api.post(`/sessions/${session._id}/submit`, {
                answers: formattedAnswers
            });
            
            navigate(`/student/exam-result/${session._id}`);
        } catch (err) {
            console.error("Lỗi khi nộp bài:", err);
            alert("Đã xảy ra lỗi khi nộp bài. Vui lòng báo cáo với giám thị!");
            setIsSubmitting(false);
            navigate('/student');
        }
    }, [answers, session, navigate, isSubmitting]);

    // Xử lý giám sát (Proctoring)
    useEffect(() => {
        if (!session) return;

        const handleViolation = async (violationType) => {
            const now = Date.now();
            if (now - lastViolationTimeRef.current < 2500) return;
            lastViolationTimeRef.current = now;

            console.warn(`Phát hiện vi phạm: ${violationType}`);
            try {
                const response = await api.post(`/sessions/${session._id}/logs`, {
                    event_type: violationType,
                    description: `Phát hiện hành vi ${violationType === 'tab_switch' ? 'chuyển Tab' : 'rời khỏi cửa sổ thi'}`
                });

                if (response.data.isLocked) {
                    alert("Tài khoản của bạn đã bị khóa khỏi bài thi do vi phạm quy chế quá nhiều lần!");
                    navigate(`/student/exam-result/${session._id}`);
                } else {
                    alert(`⚠️ CẢNH BÁO VI PHẠM: Giám thị đã ghi nhận bạn rời khỏi màn hình thi!`);
                }
            } catch (err) {
                console.error("Lỗi khi gửi log vi phạm:", err);
            }
        };

        const onVisibilityChange = () => {
            if (document.hidden) handleViolation('tab_switch');
        };

        const onWindowBlur = () => {
            if (!document.hidden) handleViolation('window_blur');
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("blur", onWindowBlur);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", onWindowBlur);
        };
    }, [session, navigate]);

    // Format thời gian
    const formatTime = (seconds) => {
        if (seconds === null || seconds < 0) return '00:00';
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

    const scrollToQuestion = (index) => {
        const el = document.getElementById(`question-card-${index}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const answeredCount = Object.keys(answers).length;
    const totalCount = questions.length;
    const isTimeWarning = timeLeft !== null && timeLeft <= 180; // Dưới 3 phút

    const styles = {
        page: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '20px 0 60px 0', fontFamily: "'Inter', sans-serif" },
        container: { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' },
        header: { position: 'sticky', top: '15px', backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, marginBottom: '24px' },
        title: { margin: 0, fontSize: '20px', color: '#f8fafc', fontWeight: '700' },
        subtitle: { margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' },
        timerBox: { display: 'flex', alignItems: 'center', gap: '10px', background: isTimeWarning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)', padding: '8px 18px', borderRadius: '12px', border: `1px solid ${isTimeWarning ? '#ef4444' : '#3b82f6'}` },
        timer: { fontSize: '22px', fontWeight: '800', color: isTimeWarning ? '#fca5a5' : '#60a5fa', fontFamily: 'monospace' },
        
        mainLayout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' },
        questionCard: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
        questionTitle: { margin: '0 0 16px 0', fontSize: '17px', color: '#f1f5f9', lineHeight: '1.6', fontWeight: '600' },
        optionsGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
        optionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', border: '1.5px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#cbd5e1', fontWeight: '500' },
        selectedOption: { display: 'flex', alignItems: 'center', padding: '14px 18px', border: '1.5px solid #3b82f6', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', fontWeight: '700' },
        radioInput: { width: '18px', height: '18px', marginRight: '14px', cursor: 'pointer', accentColor: '#3b82f6' },
        
        sidebar: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px', border: '1px solid rgba(255, 255, 255, 0.05)' },
        sidebarTitle: { margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc', fontWeight: '600' },
        progressBarBg: { width: '100%', height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' },
        progressBarFill: { height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s ease' },
        navGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
        navPill: { padding: '10px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' },

        submitBtn: { width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', marginTop: '20px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s' },
        
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalBox: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '20px', maxWidth: '440px', width: '90%', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' },
        modalTitle: { margin: '0 0 12px 0', fontSize: '22px', color: '#f8fafc', fontWeight: '700' },
        modalText: { color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' },
        modalActions: { display: 'flex', gap: '12px' },
        btnConfirm: { flex: 1, padding: '12px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
        btnCancel: { flex: 1, padding: '12px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>⚡ Đang kết nối phòng thi bảo mật...</div>;
    
    if (error) return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h2 style={{ color: '#f87171', fontSize: '20px', marginBottom: '16px' }}>❌ {error}</h2>
                    <button style={styles.submitBtn} onClick={() => navigate('/student')}>Quay lại Bảng điều khiển</button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header Thanh Giám Sát Sticky */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>{exam?.title || 'Bài thi trắc nghiệm'}</h2>
                        <p style={styles.subtitle}>Sinh viên: <strong>{user?.full_name || user?.username}</strong></p>
                    </div>
                    <div style={styles.timerBox}>
                        <span style={{ fontSize: '18px' }}>{isTimeWarning ? '⚠️' : '⏳'}</span>
                        <div style={styles.timer}>{formatTime(timeLeft)}</div>
                    </div>
                </div>

                <div style={styles.mainLayout}>
                    {/* Danh Sách Câu Hỏi */}
                    <div>
                        {questions && questions.length > 0 ? (
                            questions.map((q, index) => (
                                <div key={q._id} id={`question-card-${index}`} style={styles.questionCard}>
                                    <h4 style={styles.questionTitle}>Câu {index + 1}: {q.content || q.text}</h4>
                                    <div style={styles.optionsGrid}>
                                        {q.options && q.options.map((opt, i) => {
                                            const isSelected = answers[q._id] === opt;
                                            return (
                                                <label 
                                                    key={i} 
                                                    style={isSelected ? styles.selectedOption : styles.optionLabel}
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
                            <div style={styles.questionCard}>
                                <p style={{ color: '#94a3b8' }}>Chưa có câu hỏi cho bài thi này.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Tiến Độ & Điều Hướng Fast-Nav */}
                    <div style={styles.sidebar}>
                        <h4 style={styles.sidebarTitle}>Tiến độ bài làm</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                            <span>Đã trả lời</span>
                            <strong style={{ color: '#38bdf8' }}>{answeredCount} / {totalCount}</strong>
                        </div>
                        <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}></div>
                        </div>

                        <h4 style={{ ...styles.sidebarTitle, marginTop: '20px' }}>Danh sách câu hỏi</h4>
                        <div style={styles.navGrid}>
                            {questions.map((q, index) => {
                                const isAnswered = !!answers[q._id];
                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => scrollToQuestion(index)}
                                        style={{
                                            ...styles.navPill,
                                            backgroundColor: isAnswered ? '#3b82f6' : '#334155',
                                            color: isAnswered ? '#ffffff' : '#94a3b8'
                                        }}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            style={styles.submitBtn}
                            onClick={() => setShowConfirmModal(true)}
                        >
                            Nộp Bài Thi
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Xử Lý Xác Nhận Nộp Bài */}
            {showConfirmModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <h3 style={styles.modalTitle}>Xác nhận Nộp Bài?</h3>
                        <p style={styles.modalText}>
                            Bạn đã hoàn thành <strong>{answeredCount}</strong> / <strong>{totalCount}</strong> câu hỏi.
                            {totalCount - answeredCount > 0 && (
                                <span style={{ display: 'block', color: '#f87171', marginTop: '8px', fontWeight: '600' }}>
                                    ⚠️ Bạn vẫn còn {totalCount - answeredCount} câu chưa trả lời!
                                </span>
                            )}
                        </p>
                        <div style={styles.modalActions}>
                            <button 
                                style={styles.btnCancel} 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSubmitting}
                            >
                                Tiếp tục làm
                            </button>
                            <button 
                                style={styles.btnConfirm} 
                                onClick={executeSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Nộp ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamRoom;
