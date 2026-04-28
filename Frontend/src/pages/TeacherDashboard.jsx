import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho Modal chi tiết đề
    const [selectedExamDetails, setSelectedExamDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // State cho Modal gán sinh viên
    const [assignExamId, setAssignExamId] = useState(null);
    const [studentsList, setStudentsList] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await api.get('/exams');
                setExams(response.data);
            } catch (error) {
                console.error("Lỗi lấy danh sách kỳ thi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleViewDetails = async (examId) => {
        setLoadingDetails(true);
        try {
            const response = await api.get(`/exams/${examId}`);
            setSelectedExamDetails(response.data);
        } catch (error) {
            console.error("Lỗi lấy chi tiết kỳ thi:", error);
            alert("Không thể tải chi tiết kỳ thi!");
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => setSelectedExamDetails(null);
    const closeAssignModal = () => setAssignExamId(null);

    const handleOpenAssign = async (examId) => {
        setAssignExamId(examId);
        setLoadingStudents(true);
        try {
            const response = await api.get('/users');
            // Chỉ lấy những user là student
            const students = response.data.filter(u => u.role === 'student');
            setStudentsList(students);
        } catch (error) {
            console.error("Lỗi lấy danh sách sinh viên:", error);
            alert("Không thể tải danh sách sinh viên!");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleAssignStudent = async (studentId) => {
        try {
            await api.post(`/exams/${assignExamId}/assign`, { studentId });
            alert('Đã gán sinh viên vào kỳ thi thành công!');
        } catch (error) {
            console.error("Lỗi gán sinh viên:", error);
            alert(error.response?.data?.message || "Lỗi khi gán sinh viên");
        }
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
            color: '#4c51bf',
            margin: 0
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
        },
        greeting: {
            margin: 0,
            color: '#4a5568',
            fontWeight: '500'
        },
        userName: {
            color: '#2d3748',
            fontWeight: '700'
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
        createBtn: {
            padding: '12px 24px',
            backgroundColor: '#4c51bf',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            boxShadow: '0 4px 6px rgba(76, 81, 191, 0.25)',
            transition: 'transform 0.2s'
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
        badge: {
            display: 'inline-block',
            padding: '4px 10px',
            backgroundColor: '#ebf4ff',
            color: '#4c51bf',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginTop: '15px',
            alignSelf: 'flex-start'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px dashed #cbd5e0',
            color: '#a0aec0'
        },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', width: '100%', maxWidth: '800px', borderRadius: '12px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
        questionBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '15px' },
        correctOption: { color: '#38a169', fontWeight: 'bold' },
        studentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #edf2f7' },
        assignBtn: { padding: '6px 12px', background: '#38a169', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
    };

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <h1 style={styles.logo}>Proctor<span style={{ color: '#a0aec0' }}>System</span></h1>
                <div style={styles.userInfo}>
                    <p style={styles.greeting}>
                        Giáo viên: <span style={styles.userName}>{user?.full_name || user?.username}</span>
                    </p>
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
                    <h2 style={styles.pageTitle}>Quản lý Kỳ thi</h2>
                    <button 
                        style={styles.createBtn}
                        onClick={() => navigate('/teacher/create-exam')}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        + Tạo kỳ thi mới
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>
                        Đang tải dữ liệu kỳ thi...
                    </div>
                ) : exams.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#4a5568' }}>Chưa có kỳ thi nào</h3>
                        <p style={{ margin: 0 }}>Bạn chưa tạo kỳ thi nào. Hãy bắt đầu bằng cách tạo một kỳ thi mới!</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {exams.map((exam) => (
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
                                    <h4 style={styles.cardTitle}>{exam.title || 'Bài thi không tên'}</h4>
                                    <p style={styles.cardDetail}>
                                        <span role="img" aria-label="time">⏳</span> 
                                        Thời lượng: <strong style={styles.strong}>{exam.duration_minutes} phút</strong>
                                    </p>
                                    <p style={styles.cardDetail}>
                                        <span role="img" aria-label="start">📅</span> 
                                        Bắt đầu: <strong style={styles.strong}>{exam.start_time ? new Date(exam.start_time).toLocaleString('vi-VN') : 'N/A'}</strong>
                                    </p>
                                    <p style={styles.cardDetail}>
                                        <span role="img" aria-label="end">🏁</span> 
                                        Kết thúc: <strong style={styles.strong}>{exam.end_time ? new Date(exam.end_time).toLocaleString('vi-VN') : 'N/A'}</strong>
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={styles.badge}>
                                        {exam.questions?.length || 0} Câu hỏi
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenAssign(exam._id);
                                            }}
                                            style={{ padding: '6px 10px', background: '#f0fff4', color: '#2f855a', border: '1px solid #c6f6d5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                        >
                                            + Thêm SV
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(exam._id);
                                            }}
                                            style={{ padding: '6px 12px', background: '#edf2f7', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#edf2f7'}
                                        >
                                            {loadingDetails && selectedExamDetails?._id === exam._id ? '...' : 'Chi Tiết Đề'}
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/teacher/exam/${exam._id}/results`);
                                            }}
                                            style={{ padding: '6px 12px', background: '#ebf4ff', color: '#4c51bf', border: '1px solid #c3dafe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#c3dafe'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#ebf4ff'}
                                        >
                                            Xem Báo Cáo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Chi Tiết Đề Thi */}
                {selectedExamDetails && (
                    <div style={styles.modalOverlay} onClick={closeModal}>
                        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                                <h3 style={{ margin: 0, fontSize: '24px', color: '#2d3748' }}>Chi tiết: {selectedExamDetails.title}</h3>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#4a5568' }}>
                                <p><strong>Thời lượng:</strong> {selectedExamDetails.duration_minutes} phút</p>
                                <p><strong>Vi phạm tối đa:</strong> {selectedExamDetails.max_violations} lần</p>
                            </div>

                            <h4 style={{ color: '#2d3748', fontSize: '18px', marginBottom: '15px' }}>Danh sách câu hỏi ({selectedExamDetails.questions?.length || 0})</h4>
                            
                            {selectedExamDetails.questions && selectedExamDetails.questions.length > 0 ? (
                                selectedExamDetails.questions.map((q, index) => (
                                    <div key={q._id || index} style={styles.questionBox}>
                                        <h5 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2d3748' }}>
                                            Câu {index + 1}: {q.content} <span style={{ color: '#718096', fontSize: '14px', fontWeight: 'normal' }}>({q.points} điểm)</span>
                                        </h5>
                                        <div style={{ paddingLeft: '15px' }}>
                                            {q.options?.map((opt, i) => (
                                                <p 
                                                    key={i} 
                                                    style={{ 
                                                        margin: '5px 0', 
                                                        ...(q.correct_answer === opt ? styles.correctOption : { color: '#4a5568' }) 
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + i)}. {opt}
                                                    {q.correct_answer === opt && ' ✓ (Đáp án đúng)'}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#718096', fontStyle: 'italic' }}>Kỳ thi này chưa có câu hỏi nào.</p>
                            )}

                            <button onClick={closeModal} style={{ width: '100%', padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' }}>Đóng</button>
                        </div>
                    </div>
                )}

                {/* Modal Gán Sinh Viên */}
                {assignExamId && (
                    <div style={styles.modalOverlay} onClick={closeAssignModal}>
                        <div style={{...styles.modalContent, maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', color: '#2d3748' }}>Thêm sinh viên vào kỳ thi</h3>
                                <button onClick={closeAssignModal} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
                            </div>

                            {loadingStudents ? (
                                <p style={{ textAlign: 'center', color: '#718096' }}>Đang tải danh sách sinh viên...</p>
                            ) : studentsList.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#718096' }}>Không có sinh viên nào trong hệ thống.</p>
                            ) : (
                                <div>
                                    {studentsList.map(student => (
                                        <div key={student._id} style={styles.studentRow}>
                                            <div>
                                                <strong>{student.full_name}</strong>
                                                <div style={{ fontSize: '13px', color: '#718096' }}>{student.username}</div>
                                            </div>
                                            <button 
                                                style={styles.assignBtn}
                                                onClick={() => handleAssignStudent(student._id)}
                                            >
                                                Gán vào thi
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={closeAssignModal} style={{ width: '100%', padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' }}>Đóng</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;