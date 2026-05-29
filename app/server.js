const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const postRoutes = require('./routes/posts');
const socialRoutes = require('./routes/social');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const livesRoutes = require('./routes/lives');
const storiesRoutes = require('./routes/stories');
const groupsRoutes = require('./routes/groups');
const qrRoutes = require('./routes/qr');
const affiliateRoutes = require('./routes/affiliate');
const disputesRoutes = require('./routes/disputes');
const notificationsRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const supportRoutes = require('./routes/support');
const bookmarksRoutes = require('./routes/bookmarks');
const badgesRoutes = require('./routes/badges');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lives', livesRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/badges', badgesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'sogyTweb API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`sogyTweb Server running on port ${PORT}`);
});
