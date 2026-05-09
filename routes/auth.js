const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../models/db');
require('dotenv').config();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.render('auth', { message: "Passwords do not match." });
        }

        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.render('auth', { message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        res.render('auth', { message: "Registrasi berhasil, silakan masuk." });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.render('auth', { message: "Email tidak ditemukan." });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render('auth', { message: "Password salah." });
        }

        req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.post('/delete-account', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/auth');
        const userId = req.session.user.id;

        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const expireDate = new Date(Date.now() + 3600000); // 1 hour validity

        const [result] = await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expireDate, req.body.email]);

        if (result.affectedRows > 0) {
            console.log(`\n\n[MOCK EMAIL SENT] Reset Password Link: http://localhost:${process.env.PORT || 3000}/reset-password/${token}\n\n`);
            res.render('forgot-password', { message: 'Link reset password telah dikirim ke email (Lihat Terminal).' });
        } else {
            res.render('forgot-password', { message: 'Email tidak terdaftar.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password, confirm_password } = req.body;
        const { token } = req.params;

        if (password !== confirm_password) {
            return res.render('reset-password', { token, message: "Passwords do not match." });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

        if (users.length === 0) {
            return res.render('reset-password', { token, message: "Token tidak valid atau sudah kadaluarsa." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, users[0].id]);

        res.render('auth', { message: 'Password berhasil diubah. Silakan masuk.' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;
