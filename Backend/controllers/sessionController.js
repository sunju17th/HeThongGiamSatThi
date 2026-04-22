import ExamSession from '../models/ExamSession.js';
import Question from '../models/Question.js';

// lay danh sach tat ca cac phien thi (danh sach lich su thi cua sinh vien, va danh sach phien thi dang dien ra cua giao vien)
export const getSessions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.student_id = req.user._id;
        }

        const sessions = await ExamSession.find(query)
            .populate('exam_id', 'title');  

        return res.json(sessions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// lay thong tin chi tiet cua phien thi theo ID
export const getSessionById = async (req, res) => {
    try {
        const session = await ExamSession.findById(req.params.id)
            .populate('exam_id')  
            .populate('student_id', 'full_name username role');  
        
        if (!session) return res.status(404).json({ message: 'Phiên thi không tồn tại' });
        
        if (req.user.role === 'student' && session.student_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền xem phiên thi này' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ghi nhận một sự kiện vi phạm trong quá trình thi của sinh viên
export const addLog = async (req, res) => {
    try {
        const session = await ExamSession.findById(req.params.sessionId)
            .populate('exam_id', 'max_violations'); 

        if (!session) return res.status(404).json({ message: 'Phiên thi không tồn tại' });
        
        if (session.student_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
        }

        if (session.status !== 'ongoing') {
            return res.status(400).json({ message: 'Bài thi đã kết thúc, không thể ghi nhận thêm log.' });
        }

        const { event_type, description } = req.body;
        
        session.proctoring_logs.push({ event_type, description, timestamp: Date.now() });
        session.violation_count += 1;

        let responseMessage = 'Đã ghi nhận vi phạm';
        let isLocked = false;

        if (session.violation_count >= session.exam_id.max_violations) {
            session.status = 'locked'; 
            session.submit_time = Date.now();
            
            responseMessage = 'BÀI THI BỊ KHÓA: Bạn đã vượt quá số lần vi phạm cho phép!';
            isLocked = true;
        }

        await session.save();

        res.status(200).json({ 
            message: responseMessage,
            violation_count: session.violation_count,
            isLocked: isLocked 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// nộp bài thi của sinh viên
export const submitSession = async (req, res) => {
    try {

        const session = await ExamSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: 'Phiên thi không tồn tại' });

        if (session.student_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (session.status !== 'ongoing') {
            return res.status(400).json({ message: 'Bài thi này đã được nộp hoặc bị hủy' });
        }

        const { answers } = req.body; 
        
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Dữ liệu bài làm không hợp lệ' });
        }

        const questionIds = answers.map(ans => ans.question_id);

        const questionsList = await Question.find({ _id: { $in: questionIds } });

        const questionMap = new Map();
        questionsList.forEach(q => {
            questionMap.set(q._id.toString(), q);
        });

        let total_score = 0;
        let processedAnswers = [];

        for (let answer of answers) {
            const question = questionMap.get(answer.question_id.toString());
            
            if (question) {
                const is_correct = question.correct_answer === answer.selected_option;
                if (is_correct) {
                    total_score += question.points; 
                }

                processedAnswers.push({
                    question_id: answer.question_id,
                    selected_option: answer.selected_option,
                    is_correct
                });
            }
        }

        
        session.answers = processedAnswers;  
        session.total_score = total_score;   
        session.status = 'submitted';        
        session.submit_time = Date.now();   

        const updatedSession = await session.save();
        res.status(200).json(updatedSession);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// xóa phiên thi (chỉ giáo viên tạo đề mới được xóa)
export const deleteSession = async (req, res) => {
    try {
        const session = await ExamSession.findById(req.params.id)
            .populate('exam_id', 'teacher_id');
        
        if (!session) {
            return res.status(404).json({ message: 'Phìn thi không tồn tại' });
        }

        if (req.user.role !== 'teacher' || session.exam_id.teacher_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: 'Bạn không có quyền xóa phiên thi này. Chỉ giáo viên chủ trì đề thi mới được xóa.' 
            });
        }

        await session.deleteOne();
        res.json({ message: 'Phiên thi đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// xem lịch sử thi của chính mình (dành cho sinh viên)
export const getMyExamHistory = async (req, res) => {
    try {
        const studentId = req.user._id;

        const history = await ExamSession.find({ student_id: studentId })
            .select('-proctoring_logs')                     
            .populate('exam_id', 'title duration_minutes')  
            .sort({ submit_time: -1 });                     

        // 3. Trả về kết quả
        res.status(200).json(history);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};