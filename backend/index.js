const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pb } = require('./db/pocketbase');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const path = require('path');

dotenv.config({ path: './backend/.env' });

const app = express();

// Initialize i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'th'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}.json'),
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie'],
    },
  });

app.use(i18nextMiddleware.handle(i18next));

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// PocketBase health check (optional, but good for verification)
app.get('/api/health', async (req, res) => {
  try {
    await pb.health.check();
    res.status(200).json({ status: 'PocketBase is healthy' });
  } catch (error) {
    res.status(500).json({ status: 'PocketBase is not healthy', error: error.message });
  }
});

// Routes
app.use('/api/v1/users', require('./routes/v1/users'));
app.use('/api/v1/profile', require('./routes/v1/profile'));
app.use('/api/v1/payment', require('./routes/v1/payment'));
app.use('/api/v1/admin', require('./routes/v1/admin'));
app.use('/api/v1/chat', require('./routes/v1/chat'));
app.use('/api/v1/themes', require('./routes/v1/themes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export app for testing