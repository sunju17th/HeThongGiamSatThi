import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateExam = () => {
    const navigate = useNavigate();
    
    // Trạng thái lưu thông tin cơ bản của kỳ thi
    const [examData, setExamData] = useState({
        title: '',
        duration_minutes: 60,
        start_time: '',
        end_time: '',
        max_violations: 3
    });

    // Trạng thái lưu danh sách các câu hỏi tạm thời
    const [questions, setQuestions] = useState([
        {
            content: '',
            options: ['', '', '', ''],
            correct_answer: '',
            points: 10
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleExamChange = (e) => {
        setExamData({ ...examData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[optIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            content: '',
            options: ['', '', '', ''],
            correct_answer: '',
            points: 10
        }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Bước 1: Tạo từng câu hỏi trong danh sách bằng cách gọi API /api/questions
            const questionIds = [];
            for (let q of questions) {
                // Kiểm tra hợp lệ sơ bộ
                if (!q.content || q.options.some(opt => opt === '') || !q.correct_answer) {
                    throw new Error("Vui lòng điền đầy đủ nội dung, 4 đáp án và chọn đáp án đúng cho tất cả câu hỏi!");
                }
                
                const qRes = await api.post('/questions', q);
                questionIds.push(qRes.data._id);
            }

            // Bước 2: Dùng danh sách ID câu hỏi vừa lấy được để tạo Kỳ thi
            const payload = {
                ...examData,
                questions: questionIds
            };

            await api.post('/exams', payload);

            alert('Tạo kỳ thi thành công!');
            navigate('/teacher');

        } catch (err) {
            console.error("Lỗi khi tạo kỳ thi:", err);
            setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi hệ thống khi tạo kỳ thi.");
        } finally {
            setLoading(false);
        }
    };

    // --- CSS ---
    const styles = {
        container: { maxWidth: '800px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif" },
        header: { marginBottom: '30px', color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '10px' },
        section: { marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#4a5568', fontSize: '14px' },
        input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' },
        row: { display: 'flex', gap: '15px', marginBottom: '15px' },
        questionCard: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
        questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
        btnRemove: { padding: '5px 10px', background: '#fed7d7', color: '#c53030', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
        btnAdd: { padding: '10px 20px', background: '#edf2f7', color: '#2b6cb0', border: '1px dashed #2b6cb0', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: '600' },
        btnSubmit: { padding: '15px 30px', background: '#4c51bf', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%', marginTop: '20px' },
        errorBox: { padding: '15px', background: '#fff5f5', color: '#c53030', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fed7d7' }
    };

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '1px 0' }}>
            <div style={styles.container}>
                <h2 style={styles.header}>Tạo Kỳ Thi Mới</h2>
                
                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Phần Thông tin cơ bản */}
                    <div style={styles.section}>
                        <h3>Thông tin chung</h3>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Tên kỳ thi</label>
                            <input type="text" name="title" required value={examData.title} onChange={handleExamChange} style={styles.input} placeholder="Ví dụ: Thi cuối kỳ môn Lập trình Web" />
                        </div>
                        <div style={styles.row}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Thời gian làm bài (Phút)</label>
                                <input type="number" name="duration_minutes" required value={examData.duration_minutes} onChange={handleExamChange} style={styles.input} min="1" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Cho phép vi phạm tối đa</label>
                                <input type="number" name="max_violations" required value={examData.max_violations} onChange={handleExamChange} style={styles.input} min="1" />
                            </div>
                        </div>
                        <div style={styles.row}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Thời gian bắt đầu</label>
                                <input type="datetime-local" name="start_time" required value={examData.start_time} onChange={handleExamChange} style={styles.input} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Thời gian kết thúc</label>
                                <input type="datetime-local" name="end_time" required value={examData.end_time} onChange={handleExamChange} style={styles.input} />
                            </div>
                        </div>
                    </div>

                    {/* Phần Thêm Câu Hỏi */}
                    <div style={styles.section}>
                        <h3>Danh sách câu hỏi</h3>
                        {questions.map((q, index) => (
                            <div key={index} style={styles.questionCard}>
                                <div style={styles.questionHeader}>
                                    <strong style={{ fontSize: '16px' }}>Câu hỏi {index + 1}</strong>
                                    {questions.length > 1 && (
                                        <button type="button" style={styles.btnRemove} onClick={() => removeQuestion(index)}>Xóa câu này</button>
                                    )}
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nội dung câu hỏi</label>
                                    <input type="text" required value={q.content} onChange={(e) => handleQuestionChange(index, 'content', e.target.value)} style={styles.input} placeholder="Nhập nội dung câu hỏi..." />
                                </div>
                                <div style={styles.row}>
                                    {['A', 'B', 'C', 'D'].map((char, optIndex) => (
                                        <div key={optIndex} style={{ flex: 1 }}>
                                            <label style={styles.label}>Đáp án {char}</label>
                                            <input type="text" required value={q.options[optIndex]} onChange={(e) => handleOptionChange(index, optIndex, e.target.value)} style={styles.input} />
                                        </div>
                                    ))}
                                </div>
                                <div style={styles.row}>
                                    <div style={{ flex: 2 }}>
                                        <label style={styles.label}>Chọn đáp án đúng (A/B/C/D phải khớp nội dung ở trên)</label>
                                        <select required value={q.correct_answer} onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)} style={styles.input}>
                                            <option value="">-- Chọn đáp án đúng --</option>
                                            {q.options.map((opt, i) => opt && (
                                                <option key={i} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={styles.label}>Điểm số</label>
                                        <input type="number" required value={q.points} onChange={(e) => handleQuestionChange(index, 'points', e.target.value)} style={styles.input} min="1" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" style={styles.btnAdd} onClick={addQuestion}>
                            + Thêm một câu hỏi mới
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="button" onClick={() => navigate('/teacher')} style={{ padding: '15px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>Hủy Bỏ</button>
                        <button type="submit" disabled={loading} style={{ ...styles.btnSubmit, marginTop: 0, flex: 2, opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Đang khởi tạo hệ thống...' : 'Lưu và Tạo Kỳ Thi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExam;
