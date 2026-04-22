import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';


dotenv.config();

console.log("TEST MONGO URI: ", process.env.MONGO_URI);

const app = express();

app.use(express.json()); 
app.use(cors()); 

// Kết nối MongoDB
connectDB();

// Health Check Route
app.get('/', (req, res) => {
    res.send('API is running...');
});


// Import các Routes
import userRoutes from './routes/userRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import examRoutes from './routes/examRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

// Nạp các Routes vào application
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
