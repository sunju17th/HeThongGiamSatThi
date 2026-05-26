import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview');
    
    // States cho Overview
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    
    // States cho Users
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    // States cho Exams
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);

    // Initial Fetch for Stats
    useEffect(() => {
        fetchStats();
    }, []);

    // Tab change effect
    useEffect(() => {
        if (activeTab === 'users' && users.length === 0) {
            fetchUsers();
        } else if (activeTab === 'exams' && exams.length === 0) {
            fetchExams();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách người dùng:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchExams = async () => {
        setLoadingExams(true);
        try {
            const response = await api.get('/exams');
            setExams(response.data);
        } catch (error) {
            console.error("Lỗi tải danh sách bài thi:", error);
        } finally {
            setLoadingExams(false);
        }
    };

    // --- Action Handlers ---
    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'student' ? 'teacher' : 'student';
        if (!window.confirm(`Bạn có chắc muốn đổi quyền người dùng này thành ${newRole.toUpperCase()}?`)) return;
        
        try {
            await api.put(`/users/${userId}`, { role: newRole });
            alert("Cập nhật quyền thành công!");
            // Cập nhật lại UI nội bộ
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            fetchStats(); // Update stats
        } catch (error) {
            alert("Lỗi khi cập nhật quyền: " + (error.response?.data?.message || ""));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("CẢNH BÁO: Xóa người dùng này sẽ không thể khôi phục. Tiếp tục?")) return;
        try {
            await api.delete(`/users/${userId}`);
            alert("Đã xóa người dùng!");
            setUsers(users.filter(u => u._id !== userId));
            fetchStats(); // Update stats
        } catch (error) {
            alert("Lỗi khi xóa: " + (error.response?.data?.message || ""));
        }
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm("CẢNH BÁO: Bài thi và TOÀN BỘ kết quả làm bài của học sinh sẽ bị xóa. Chắc chắn xóa?")) return;
        try {
            await api.delete(`/exams/${examId}/sessions`);
            alert("Đã xóa bài thi và tất cả phiên làm bài liên quan!");
            setExams(exams.filter(e => e._id !== examId));
            fetchStats(); // Update stats
        } catch (error) {
            alert("Lỗi khi xóa bài thi: " + (error.response?.data?.message || ""));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Styling ---
    const styles = {
        container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Inter', sans-serif" },
        sidebar: { width: '250px', backgroundColor: '#111c44', color: 'white', padding: '30px 20px', display: 'flex', flexDirection: 'column' },
        sidebarTitle: { fontSize: '24px', fontWeight: 'bold', margin: '0 0 40px 0', color: '#fff', textAlign: 'center', letterSpacing: '1px' },
        navItem: { padding: '15px 20px', margin: '5px 0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' },
        activeNav: { backgroundColor: '#4318ff', color: 'white', boxShadow: '0 4px 15px rgba(67, 24, 255, 0.4)' },
        inactiveNav: { color: '#a3aed1', backgroundColor: 'transparent' },
        content: { flex: 1, padding: '40px', overflowY: 'auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
        pageTitle: { fontSize: '32px', color: '#2b3674', margin: 0, fontWeight: 'bold' },
        logoutBtn: { padding: '10px 20px', backgroundColor: '#ffe5d3', color: '#e05c2b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
        
        // Stats Cards
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' },
        statCard: { backgroundColor: 'white', padding: '25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
        statIcon: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px' },
        statValue: { fontSize: '30px', fontWeight: 'bold', color: '#2b3674', margin: '5px 0 0 0' },
        statLabel: { fontSize: '14px', color: '#a3aed1', margin: 0 },

        // Tables
        tableCard: { backgroundColor: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
        th: { textAlign: 'left', padding: '15px', color: '#a3aed1', fontSize: '14px', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '15px', color: '#2b3674', borderBottom: '1px solid #e2e8f0', fontSize: '15px', fontWeight: '500' },
        badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
        btnAction: { padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginRight: '10px', transition: 'all 0.2s' }
    };

    const renderOverview = () => {
        if (loadingStats) return <div style={{ color: '#a3aed1' }}>Đang tải số liệu...</div>;
        if (!stats) return <div style={{ color: '#e53e3e' }}>Không tải được số liệu</div>;

        return (
            <div>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: '#e2e8f0', color: '#4318ff' }}>👥</div>
                        <div>
                            <p style={styles.statLabel}>Tổng Người Dùng</p>
                            <h3 style={styles.statValue}>{stats.users.total}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: '#f0fff4', color: '#38a169' }}>👨‍🏫</div>
                        <div>
                            <p style={styles.statLabel}>Giáo viên</p>
                            <h3 style={styles.statValue}>{stats.users.teachers}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: '#ebf8ff', color: '#3182ce' }}>🎓</div>
                        <div>
                            <p style={styles.statLabel}>Học sinh</p>
                            <h3 style={styles.statValue}>{stats.users.students}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: '#faf5ff', color: '#805ad5' }}>📝</div>
                        <div>
                            <p style={styles.statLabel}>Tổng Kỳ Thi</p>
                            <h3 style={styles.statValue}>{stats.exams.total}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: '#fffaf0', color: '#dd6b20' }}>✅</div>
                        <div>
                            <p style={styles.statLabel}>Lượt Nộp Bài</p>
                            <h3 style={styles.statValue}>{stats.sessions.total}</h3>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: '#fff5f5', color: '#e53e3e' }}>🚫</div>
                        <div>
                            <p style={styles.statLabel}>Bài Thi Bị Khóa (Gian lận)</p>
                            <h3 style={styles.statValue}>{stats.sessions.locked}</h3>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUsers = () => {
        if (loadingUsers) return <div style={{ color: '#a3aed1' }}>Đang tải danh sách...</div>;

        return (
            <div style={styles.tableCard}>
                <h3 style={{ color: '#2b3674', margin: '0 0 20px 0' }}>Quản lý Người Dùng</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Họ Tên</th>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Vai trò (Role)</th>
                            <th style={styles.th}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td style={styles.td}>{u.full_name}</td>
                                <td style={styles.td}>{u.username}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: u.role === 'admin' ? '#4318ff' : (u.role === 'teacher' ? '#38a169' : '#a3aed1'),
                                        color: 'white'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {u.role !== 'admin' && (
                                        <>
                                            <button 
                                                style={{ ...styles.btnAction, backgroundColor: '#ebf8ff', color: '#3182ce' }}
                                                onClick={() => handleRoleChange(u._id, u.role)}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#bee3f8'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ebf8ff'}
                                            >
                                                Đổi thành {u.role === 'student' ? 'Giáo viên' : 'Học sinh'}
                                            </button>
                                            <button 
                                                style={{ ...styles.btnAction, backgroundColor: '#fff5f5', color: '#e53e3e' }}
                                                onClick={() => handleDeleteUser(u._id)}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fed7d7'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                                            >
                                                Xóa
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderExams = () => {
        if (loadingExams) return <div style={{ color: '#a3aed1' }}>Đang tải danh sách...</div>;

        return (
            <div style={styles.tableCard}>
                <h3 style={{ color: '#2b3674', margin: '0 0 20px 0' }}>Quản lý Kỳ Thi Toàn Hệ Thống</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tên Kỳ Thi</th>
                            <th style={styles.th}>Số Câu Hỏi</th>
                            <th style={styles.th}>Bắt Đầu</th>
                            <th style={styles.th}>Kết Thúc</th>
                            <th style={styles.th}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map(exam => (
                            <tr key={exam._id}>
                                <td style={styles.td}><strong>{exam.title}</strong></td>
                                <td style={styles.td}>{exam.questions?.length || 0} câu</td>
                                <td style={styles.td}>{new Date(exam.start_time).toLocaleString('vi-VN')}</td>
                                <td style={styles.td}>{new Date(exam.end_time).toLocaleString('vi-VN')}</td>
                                <td style={styles.td}>
                                    <button 
                                        style={{ ...styles.btnAction, backgroundColor: '#fff5f5', color: '#e53e3e' }}
                                        onClick={() => handleDeleteExam(exam._id)}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fed7d7'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                                    >
                                        Xóa Bài Thi
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.sidebarTitle}>Admin Panel</h2>
                <div 
                    style={activeTab === 'overview' ? { ...styles.navItem, ...styles.activeNav } : { ...styles.navItem, ...styles.inactiveNav }}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Thống kê chung
                </div>
                <div 
                    style={activeTab === 'users' ? { ...styles.navItem, ...styles.activeNav } : { ...styles.navItem, ...styles.inactiveNav }}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Quản lý Người dùng
                </div>
                <div 
                    style={activeTab === 'exams' ? { ...styles.navItem, ...styles.activeNav } : { ...styles.navItem, ...styles.inactiveNav }}
                    onClick={() => setActiveTab('exams')}
                >
                    📝 Quản lý Kỳ thi
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.pageTitle}>
                        {activeTab === 'overview' && 'Tổng Quan Hệ Thống'}
                        {activeTab === 'users' && 'Quản Lý Người Dùng'}
                        {activeTab === 'exams' && 'Quản Lý Kỳ Thi'}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ color: '#2b3674', fontWeight: '600' }}>
                            Xin chào, <span style={{ color: '#4318ff' }}>{user?.full_name || 'Admin'}</span>
                        </div>
                        <button 
                            style={styles.logoutBtn} 
                            onClick={handleLogout}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e05c2b'; e.currentTarget.style.color = 'white'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffe5d3'; e.currentTarget.style.color = '#e05c2b'; }}
                        >
                            Đăng Xuất
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'exams' && renderExams()}
            </div>
        </div>
    );
};

export default AdminDashboard;
