// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateExam from './pages/CreateExam';
import ExamResults from './pages/ExamResults';
import StudentPortal from './pages/StudentPortal';
import StudentHistory from './pages/StudentHistory';
import HomePage from './pages/HomePage';

import ExamRoom from './pages/ExamRoom';

// --- Component Bảo vệ Route ---
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Đang kiểm tra quyền...</div>;
    
    // Nếu chưa đăng nhập -> đuổi về trang login
    if (!user) return <Navigate to="/login" replace />;
    
    // Nếu sai role (vd sinh viên lén vào trang giáo viên) -> đuổi về trang chủ
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
    
    return children; // Nếu hợp lệ thì cho phép hiển thị trang
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Áp dụng bảo vệ cho trang Teacher */}
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/create-exam" 
              element={
                <ProtectedRoute allowedRole="teacher">
                  <CreateExam />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teacher/exam/:id/results" 
              element={
                <ProtectedRoute allowedRole="teacher">
                  <ExamResults />
                </ProtectedRoute>
              } 
            />
            
            {/* Áp dụng bảo vệ cho trang Sinh Viên */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentPortal />
                </ProtectedRoute>
              } 
            />

            {/* Lịch sử bài thi sinh viên */}
            <Route 
              path="/student/history" 
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentHistory />
                </ProtectedRoute>
              } 
            />

            {/* Route Phòng Thi */}
            <Route 
              path="/exam/:id" 
              element={
                <ProtectedRoute allowedRole="student">
                  <ExamRoom />
                </ProtectedRoute>
              } 
            />
          </Routes>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;