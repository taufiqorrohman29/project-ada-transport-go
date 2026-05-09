const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const { initDB } = require('./models/db');

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || '<MASUKKAN_KODE_RAHASIA_SESI_DISINI>',
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
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Init DB and Start Server
initDB().then(() => {
    // --- HTTPS server (required for camera on mobile) ---
    const certPath = path.join(__dirname, 'cert.pem');
    const keyPath = path.join(__dirname, 'key.pem');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        const httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
            console.log(`HTTPS server running on port ${HTTPS_PORT}`);
        });
    }

    // --- HTTP server: redirect to HTTPS for camera-dependent paths ---
    const httpApp = express();
    httpApp.use((req, res, next) => {
        // Redirect scanner page to HTTPS so camera works
        if (req.path.startsWith('/admin/scanner')) {
            const httpsUrl = `https://${req.hostname}:${HTTPS_PORT}${req.url}`;
            return res.redirect(301, httpsUrl);
        }
        next();
    });
    // For all other routes, serve normally over HTTP
    httpApp.use(app);
    const httpServer = http.createServer(httpApp);
    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`HTTP port ${HTTP_PORT} already in use — HTTPS-only mode on port ${HTTPS_PORT}`);
        } else {
            console.error('HTTP server error:', err);
        }
    });
    httpServer.listen(HTTP_PORT, () => {
        console.log(`HTTP  server running on port ${HTTP_PORT}`);
        console.log(`For QR scanner use HTTPS: https://<IP>:${HTTPS_PORT}/admin/scanner`);
    });
});
