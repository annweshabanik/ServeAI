import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import { globalErrorHandler } from './middleware/errorMiddleware';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'serveai_super_secret_jwt_key_2026_pos';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/superadmin', superAdminRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'ServeAI Backend Server is running smoothly!',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler Middleware (Must be last)
app.use(globalErrorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ServeAI Backend Server running on http://localhost:${PORT}`);
});