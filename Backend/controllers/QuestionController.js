import Question from '../models/Question.js';

// tao cau hoi moi
export const createQuestion = async (req, res) => {
    try {
        const questionData = {
            content: req.body.content,
            options: req.body.options,
            correct_answer: req.body.correct_answer,
            points: req.body.points,
        };

        const newQuestion = await Question.create(questionData);
        return res.status(201).json(newQuestion);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// lay tat ca cau hoi
export const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find({});
        return res.json(questions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// lay cau hoi theo id
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        return res.json(question);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// cap nhat cau hoi
export const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const { content, options, correct_answer, points } = req.body;

        if (content !== undefined) {
            question.content = content;
        }
        if (options !== undefined) {
            question.options = options;
        }
        if (correct_answer !== undefined) {
            question.correct_answer = correct_answer;
        }
        if (points !== undefined) {
            question.points = points;
        }

        const updatedQuestion = await question.save();
        return res.json(updatedQuestion);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// cap nhat cau hoi
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await question.deleteOne();
        return res.json({ message: 'Question removed' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
