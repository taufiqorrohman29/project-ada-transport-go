const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { pool } = require('../models/db');
require('dotenv').config();

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

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
            const protocol = req.get('x-forwarded-proto') || req.protocol;
            const resetLink = `${protocol}://${req.get('host')}/reset-password/${token}`;
            const mailOptions = {
                from: process.env.SMTP_USER || '"Ada Transport Go" <no-reply@adago.com>',
                to: req.body.email,
                subject: 'Pemberitahuan Reset Password - Ada Transport Go',
                html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 40px 20px; border-radius: 10px;">
                    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center;">
                        <h1 style="color: #2a9d8f; margin-bottom: 10px; font-size: 28px;">Ada Transport Go</h1>
                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            Halo, kami menerima permintaan untuk mengatur ulang kata sandi pada akun Anda. 
                            Silakan klik tombol di bawah ini untuk membuat sandi baru.
                        </p>
                        <a href="${resetLink}" style="display: inline-block; background-color: #4590dbff; color: #172bdeff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 30px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            Reset Password Sekarang
                        </a>
                        <p style="color: #888; font-size: 13px; line-height: 1.5; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                            Tautan ini hanya berlaku selama <strong>1 jam</strong>.<br>
                            Jika Anda tidak pernah meminta pergantian password, abaikan saja email ini dan akun Anda akan dipastikan tetap aman.
                        </p>
                    </div>
                </div>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.render('forgot-password', { message: 'Gagal mengirim email reset password. Silakan hubungi administrator.' });
                }
                console.log('Reset Password Email sent: ' + info.response);
                res.render('forgot-password', { message: 'Link reset password telah dikirim ke email.' });
            });
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
