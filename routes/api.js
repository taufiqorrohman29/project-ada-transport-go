const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { pool } = require('../models/db');

// Booking checkout
router.post('/booking/checkout', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth');
    try {
        const { type, detail, basePrice, date, time, passengers, payment_method } = req.body;

        const ref = 'ATGO-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const priceNum = parseInt(basePrice) * parseInt(passengers);
        const formattedPrice = 'Rp ' + priceNum.toLocaleString('id-ID');

        await pool.query(
            'INSERT INTO bookings (user_id, booking_ref, type, detail, price, date, time, passengers, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.session.user.id, ref, type, detail, formattedPrice, date, time, passengers, payment_method, 'Lunas']
        );

        res.redirect('/ticket/' + ref);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error compiling booking.");
    }
});

// Admin validation API
router.post('/verify', async (req, res) => {
    try {
        const { booking_ref } = req.body;
        const [bookings] = await pool.query(`
            SELECT b.*, u.username as customer_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.booking_ref = ?
        `, [booking_ref]);

        if (bookings.length === 0) {
            return res.json({ success: false, message: "KODE TIKET TIDAK DITEMUKAN" });
        }

        const booking = bookings[0];
        res.json({
            success: true,
            data: {
                id: booking.booking_ref,
                name: booking.customer_name,
                type: booking.type,
                detail: booking.detail,
                status: booking.status
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Contact Form submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        await pool.query(
            'INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );
        res.redirect('/kontak?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send("Gagal mengirim pesan.");
    }
});

module.exports = router;
