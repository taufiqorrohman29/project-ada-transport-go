const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const { pool } = require('../models/db');

router.get('/', (req, res) => res.render('home'));
router.get('/layanan', async (req, res) => {
    try {
        const [vehicles] = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
        const [intercities] = await pool.query('SELECT * FROM intercity ORDER BY created_at DESC');
        const [tourisms] = await pool.query('SELECT * FROM tourism ORDER BY created_at DESC');
        res.render('layanan', { vehicles, intercities, tourisms });
    } catch (e) {
        console.error(e);
        res.render('layanan', { vehicles: [], intercities: [], tourisms: [] });
    }
});
router.get('/destinasi', (req, res) => res.render('destinasi'));

router.get('/booking', async (req, res) => {
    try {
        const [vehicles] = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
        const [intercities] = await pool.query('SELECT * FROM intercity ORDER BY created_at DESC');
        const [tourisms] = await pool.query('SELECT * FROM tourism ORDER BY created_at DESC');
        res.render('booking', { vehicles, intercities, tourisms });
    } catch (e) {
        console.error(e);
        res.render('booking', { vehicles: [], intercities: [], tourisms: [] });
    }
});

router.get('/kontak', (req, res) => res.render('kontak'));
router.get('/auth', (req, res) => res.render('auth'));
router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/auth');
    res.render('profile');
});

router.get('/booking-history', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth');
    try {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC', [req.session.user.id]);
        res.render('booking-history', { bookings });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching booking history");
    }
});


// Dynamic E-Ticket Route
router.get('/ticket/:ref', async (req, res) => {
    try {
        const [bookings] = await pool.query('SELECT b.*, u.username as customer_name FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.booking_ref = ?', [req.params.ref]);
        if (bookings.length === 0) return res.status(404).send('Tiket tidak ditemukan');

        const booking = bookings[0];
        const qrImage = await qrcode.toDataURL(booking.booking_ref);
        res.render('ticket', { booking, qrImage });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error generating ticket");
    }
});

// Forgot Password Views
router.get('/forgot-password', (req, res) => res.render('forgot-password'));
router.get('/reset-password/:token', (req, res) => res.render('reset-password', { token: req.params.token }));

module.exports = router;
