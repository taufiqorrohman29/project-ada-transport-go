const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const { initDB } = require('./models/db');

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set Trust Proxy to correctly handle HTTPS forwards from NGINX/ngrok
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Allow camera + other permissions for QR scanner (Permissions-Policy header)
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=*, microphone=*');
    next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Global variable across templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Import Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

const HTTP_PORT = process.env.PORT || 3000;

// Init DB and Start Server
initDB().then(() => {
    // Start HTTP server
    const httpServer = http.createServer(app);
    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`HTTP port ${HTTP_PORT} already in use`);
        } else {
            console.error('HTTP server error:', err);
        }
    });
    httpServer.listen(HTTP_PORT, () => {
        console.log(`HTTP server running on port ${HTTP_PORT}`);
    });
});
