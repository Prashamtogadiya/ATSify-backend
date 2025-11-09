import express from 'express';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
const app = express();
app.use(express.json());

// Route for health check up
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

export default app;
