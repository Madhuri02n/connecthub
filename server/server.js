require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

// Fail fast if required env vars are missing
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

connectDB();

const server = http.createServer(app);

// --- Socket.IO for real-time notifications and chat (bonus feature) ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Authenticate socket connections using the same JWT used for REST auth
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return next(new Error('Authentication failed'));

    socket.userId = String(user._id);
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  // Each user joins a private room keyed by their own id, so server-side
  // code can do io.to(userId).emit(...) to reach them specifically.
  socket.join(socket.userId);
  console.log(`Socket connected: user ${socket.userId}`);

  // --- Real-time chat (bonus feature) ---
  socket.on('chat:message', ({ toUserId, message }) => {
    if (!toUserId || !message) return;
    io.to(toUserId).emit('chat:message', {
      fromUserId: socket.userId,
      message,
      sentAt: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: user ${socket.userId}`);
  });
});

// Make `io` available to controllers via req.app.get('io')
app.set('io', io);

server.listen(PORT, () => {
  console.log(`ConnectHub server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// --- Graceful shutdown & unhandled error safety nets ---
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => console.log('Process terminated.'));
});
