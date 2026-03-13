// ============================================
// LUMINA GUARD BACKEND SERVER
// Complete & Error-Free
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// ============================================
// INITIALIZE EXPRESS & SOCKET.IO
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: [
    'https://lumina-guard-safety-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ============================================
// SOCKET.IO - REAL-TIME CONNECTION
// ============================================
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  socket.on('join-sos-room', (data) => {
    const { userId, alertId } = data;
    socket.join(`sos-${alertId}`);
    activeSessions.set(userId, { socketId: socket.id, alertId, joinedAt: new Date() });
    console.log(`👤 User ${userId} joined SOS room: sos-${alertId}`);
    io.emit('new-sos-alert', { userId, alertId, timestamp: new Date() });
  });

  socket.on('location-update', async (data) => {
    const { userId, alertId, latitude, longitude, accuracy, timestamp } = data;
    console.log(`📍 Location update from user ${userId}:`, { latitude, longitude });

    io.to(`sos-${alertId}`).emit('location-updated', {
      userId, alertId,
      location: { latitude, longitude, accuracy },
      timestamp
    });

    io.emit('admin-location-update', {
      userId, alertId,
      location: { latitude, longitude, accuracy },
      timestamp
    });

    try {
      const Alert = require('./models/Alert');
      await Alert.findByIdAndUpdate(alertId, {
        location: { type: 'Point', coordinates: [longitude, latitude] },
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating alert location:', error);
    }
  });

  socket.on('end-sos', (data) => {
    const { userId, alertId } = data;
    console.log(`🛑 User ${userId} ended SOS alert ${alertId}`);
    socket.leave(`sos-${alertId}`);
    activeSessions.delete(userId);
    io.to(`sos-${alertId}`).emit('sos-ended', { alertId, endedAt: new Date() });
    io.emit('admin-sos-ended', { alertId });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    for (const [userId, session] of activeSessions.entries()) {
      if (session.socketId === socket.id) {
        activeSessions.delete(userId);
        console.log(`👤 User ${userId} disconnected from active SOS`);
        break;
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

app.get('/api/sos/active-sessions', (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([userId, session]) => ({
    userId,
    ...session
  }));
  res.json({ success: true, count: sessions.length, sessions });
});

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina-guard')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('💡 Check your MONGODB_URI in .env file');
  });

// ============================================
// ROUTES
// ============================================
const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');
const reportsRoutes = require('./routes/reports');
const contactsRoutes = require('./routes/contacts');

app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/contacts', contactsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌟 Lumina Guard API - Your Circle of Light',
    tagline: 'Global Women\'s Safety Platform',
    status: 'Server is running',
    version: '2.0.0',
    features: {
      authentication: 'JWT-based secure auth',
      sos: 'Emergency SOS with geolocation',
      realtime: 'Socket.io real-time tracking',
      map: 'Interactive safety map',
      reports: 'Incident reporting',
      contacts: 'Emergency contacts'
    }
  });
});

// SS404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('');
  console.log('🌟 ═══════════════════════════════════════════');
  console.log('   LUMINA GUARD - Backend Server');
  console.log('   Your Circle of Light, Always Protecting');
  console.log('🌟 ═══════════════════════════════════════════');
  console.log('');
  console.log('🚀 Server running on port', PORT);
  console.log('📍 Access at: http://localhost:' + PORT);
  console.log('🔴 Socket.io ready for real-time connections');
  console.log('');
});