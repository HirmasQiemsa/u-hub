import express, { type Application, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectionDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

// Load environment .env
dotenv.config();

// Connect to database
connectionDB();

const app: Application = express();

// Middleware
app.use(cors()); // Hit API from different domain 
app.use(express.json()); // Parse JSON request body
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api', apiRoutes); // API routes

// Routes
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'API is running smoothly!' });
});

const PORT = process.env.PORT || 5000;

app.listen (PORT, () => {
    console.log(`[🚀] Server is running on port ${PORT}`);
});