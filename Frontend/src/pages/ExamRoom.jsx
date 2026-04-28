import React, { useState, useEffect, useCallback } from 'react';
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

    // Bắt đầu vào thi
    useEffect(() => {
        const joinExam = async () => {
            try {
                const response = await api.post(`/exams/${examId}/join`);
                // Giả định backend trả về { session, exam, questions } hoặc kết cấu tương tự
                const { session: sessionData, exam: examData, questions: questionsData } = response.data;
                
                setSession(sessionData);
                setExam(examData);
                setQuestions(questionsData || examData.questions || []);
                
                // Khởi tạo thời gian còn lại (tính bằng giây)
                // Nếu backend trả về thời gian còn lại (remainingSeconds) thì dùng, nếu không thì dùng duration_minutes
                const durationSeconds = response.data.remainingTime || (examData.duration_minutes * 60) || 3600;
                setTimeLeft(durationSeconds);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi khi tham gia kỳ thi:", err);
                setError(err.response?.data?.message || "Không thể vào phòng thi. Có thể bạn đã thi hoặc lỗi máy chủ.");
                setLoading(false);
            }
        };

        joinExam();
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
            
            alert(`Nộp bài thành công! Điểm của bạn: ${response.data.score || 0}`);
            navigate('/student');
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
                    navigate('/student');
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

    // --- Inline CSS ---
    const styles = {
        container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' },
        header: { position: 'sticky', top: 0, backgroundColor: 'white', padding: '15px', borderBottom: '2px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
        timer: { fontSize: '24px', fontWeight: 'bold', color: timeLeft < 60 ? 'red' : '#333' },
        errorMsg: { color: 'red', textAlign: 'center', marginTop: '50px' },
        questionCard: { border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '20px', backgroundColor: '#fdfdfd' },
        optionLabel: { display: 'block', margin: '10px 0', cursor: 'pointer', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
        selectedOption: { display: 'block', margin: '10px 0', cursor: 'pointer', padding: '10px', border: '1px solid #4CAF50', backgroundColor: '#e8f5e9', borderRadius: '5px' },
        submitBtn: { padding: '12px 25px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'block', margin: '30px auto' }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang nạp dữ liệu phòng thi...</div>;
    
    if (error) return (
        <div style={styles.container}>
            <h2 style={styles.errorMsg}>{error}</h2>
            <button style={styles.submitBtn} onClick={() => navigate('/student')}>Quay lại</button>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0 }}>{exam?.title || 'Bài thi'}</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Sinh viên: {user?.username}</p>
                </div>
                <div style={styles.timer}>
                    ⏳ {formatTime(timeLeft)}
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                {questions && questions.length > 0 ? (
                    questions.map((q, index) => (
                        <div key={q._id} style={styles.questionCard}>
                            <h4>Câu {index + 1}: {q.content || q.text}</h4>
                            <div>
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
                                                style={{ marginRight: '10px' }}
                                            />
                                            {opt}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Không có dữ liệu câu hỏi.</p>
                )}

                <button style={styles.submitBtn} onClick={handleSubmit}>
                    Nộp Bài
                </button>
            </div>
        </div>
    );
};

export default ExamRoom;
