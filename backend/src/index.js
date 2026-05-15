const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const sequelize = require('./config/db');
const User = require('./models/User');
require('./models/Poll');
require('./models/Response');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');
const responseRoutes = require('./routes/responses');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// Connect to PostgreSQL and sync models
// (called at the bottom inside the async startup IIFE)

// Security headers
app.use(helmet());

// Global rate limiter — 100 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Middleware
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/responses', responseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PulseBoard API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Initialize Socket.io
initSocket(io);

const seedDemoUser = async () => {
  const existing = await User.findOne({ where: { email: 'demo@pulseboard.dev' } });
  if (!existing) {
    await User.create({
      name: 'Demo User',
      email: 'demo@pulseboard.dev',
      password: 'demo123',
    });
    console.log('Demo user created: demo@pulseboard.dev / demo123');
  }
};

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.sync();
    console.log('PostgreSQL connected and tables synced');
    await seedDemoUser();
    server.listen(PORT, () => {
      console.log(`PulseBoard server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
})();
