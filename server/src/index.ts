import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.js';
import casesRoutes from './routes/cases.js';
import aiRoutes from './routes/ai.js';
import hearingsRoutes from './routes/hearings.js';
import analyticsRoutes from './routes/analytics.js';
import documentsRoutes from './routes/documents.js';
import draftsRoutes from './routes/drafts.js';
import auditRoutes from './routes/audit.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hearings', hearingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/drafts', draftsRoutes);
app.use('/api/audit', auditRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'LEXORA AI Judicial Intelligence Platform Backend',
    timestamp: new Date().toISOString(),
  });
});

// Socket.io Real-time event handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSockets: ${socket.id}`);

  socket.on('join_case_room', (caseId) => {
    socket.join(`case_${caseId}`);
    console.log(`Client ${socket.id} joined case room: case_${caseId}`);
  });

  socket.on('send_notification', (data) => {
    io.emit('new_notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`⚡ Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 LEXORA AI Backend running on http://localhost:${PORT}`);
});
