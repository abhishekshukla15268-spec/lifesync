import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Import database (this initializes it)
import './db.js';

// Import routes
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║     LifeSync API Server                   ║
║     Running on http://localhost:${PORT}      ║
╚═══════════════════════════════════════════╝
  `);
});

export default app;
