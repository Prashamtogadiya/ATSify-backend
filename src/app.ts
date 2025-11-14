import express from 'express';
import authRouter from './routes/auth.routes';
import resumeRouter from './routes/resume.routes';  
import jobRequestRoutes from './routes/jobRequest.routes';
import analysisRouter from './routes/analysis.routes';
import cookieParser from 'cookie-parser';
import { errorHandler } from "./middleware/errorHandler";
import path from 'path';

const app = express();
app.use(express.json());

app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/resume', resumeRouter);
app.use("/api/v1/job-requests", jobRequestRoutes);
app.use("/api/v1/analysis", analysisRouter);


app.use(errorHandler); // always last


export default app;
