import express from 'express';
import healthRouter from './routes/health';
import authRouter from './routes/auth.routes';
import cookieParser from 'cookie-parser';
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(express.json());

app.use(cookieParser());
// Route for health check up
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler); // always last


export default app;
