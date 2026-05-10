const express = require('express');
const router = express.Router();
const { pool } = require('../models/db');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Protection Middleware: Check if user exists and is admin
router.use((req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Akses ditolak. Silahkan <a href="/auth">login</a> menggunakan akun administrator.');
    }
    next();
});

// Dashboard Route: View bookings and vehicles
router.get('/', async (req, res) => {
    try {
        const [vehicles] = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
        const [bookings] = await pool.query('SELECT b.*, u.username as customer_name FROM bookings b JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC');
        const [intercities] = await pool.query('SELECT * FROM intercity ORDER BY created_at DESC');
        const [tourisms] = await pool.query('SELECT * FROM tourism ORDER BY created_at DESC');

        res.render('admin/dashboard', { vehicles, bookings, intercities, tourisms });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rendering admin dashboard");
    }
});

// Bulk delete bookings
router.post('/bookings/delete-all', async (req, res) => {
    try {
        await pool.query('DELETE FROM bookings');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal membersihkan histori pesanan.");
    }
});

// Delete single booking
router.post('/bookings/delete/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal menghapus pesanan.");
    }
});

// Add Vehicle Route
router.post('/vehicle', upload.single('image'), async (req, res) => {
    try {
        const { name, capacity, price } = req.body;
        const image = req.file ? '/uploads/' + req.file.filename : '/imagebooking2/Elf.jpg';

        await pool.query('INSERT INTO vehicles (name, capacity, price, image) VALUES (?, ?, ?, ?)', [name, capacity, parseInt(price), image]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding vehicle");
    }
});

// Add Intercity Route
router.post('/intercity', upload.fields([{ name: 'image_1', maxCount: 1 }, { name: 'image_2', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, route_desc, price } = req.body;
        const image_1 = req.files && req.files['image_1'] ? '/uploads/' + req.files['image_1'][0].filename : '/imagebooking1/Blitar.jpg';
        const image_2 = req.files && req.files['image_2'] ? '/uploads/' + req.files['image_2'][0].filename : '/imagebooking1/Juanda.jpg';

        await pool.query('INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES (?, ?, ?, ?, ?)', [name, route_desc, parseInt(price), image_1, image_2]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding intercity route");
    }
});

// Add Tourism Route
router.post('/tourism', upload.fields([{ name: 'image_1', maxCount: 1 }, { name: 'image_2', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, duration, destinations, price } = req.body;
        const image_1 = req.files && req.files['image_1'] ? '/uploads/' + req.files['image_1'][0].filename : '/imagebooking3/Bali1.jpg';
        const image_2 = req.files && req.files['image_2'] ? '/uploads/' + req.files['image_2'][0].filename : '/imagebooking3/Bali2.jpg';

        await pool.query('INSERT INTO tourism (name, duration, destinations, price, image_1, image_2) VALUES (?, ?, ?, ?, ?, ?)', [name, duration, destinations, parseInt(price), image_1, image_2]);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding tourism package");
    }
});

// Scanner Route
router.get('/scanner', (req, res) => {
    const hostHeader = req.get('host') || req.hostname || '';
    const isLocalNetwork = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostHeader);
    const proto = req.get('x-forwarded-proto') || req.protocol;

    console.log(`[SCANNER DEBUG] Host: ${hostHeader}, Protocol: ${proto}, Local: ${isLocalNetwork}`);

    if (isLocalNetwork && proto !== 'https') {
        const domain = hostHeader.split(':')[0];
        const httpsUrl = `https://${domain}:3443${req.originalUrl}`;
        return res.redirect(302, httpsUrl);
    }

    res.render('scanner');
});

// Inbox / Messages Route
router.get('/messages', async (req, res) => {
    try {
        const [messages] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.render('admin/messages', { messages });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error rendering admin messages");
    }
});

// Delete Message Route
router.post('/messages/delete/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
        res.redirect('/admin/messages');
    } catch (err) {
        console.error(err);
        res.status(500).send("Gagal menghapus pesan");
    }
});

// Unified Delete Route
router.post('/delete/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const validTypes = ['vehicles', 'intercity', 'tourism'];
    if (!validTypes.includes(type)) return res.redirect('/admin');
    try {
        await pool.query(`DELETE FROM ${type} WHERE id = ?`, [id]);
        res.redirect('/admin');
    } catch (e) {
        console.error(e);
        res.status(500).send("Error deleting record");
    }
});

// Unified Edit Route (GET)
router.get('/edit/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const validTypes = ['vehicles', 'intercity', 'tourism'];
    if (!validTypes.includes(type)) return res.redirect('/admin');
    try {
        const [rows] = await pool.query(`SELECT * FROM ${type} WHERE id = ?`, [id]);
        if (rows.length === 0) return res.redirect('/admin');
        res.render('admin/edit-service', { type, item: rows[0] });
    } catch (e) {
        console.error(e);
        res.status(500).send("Error loading edit page");
    }
});

// Unified Edit Route (POST)
router.post('/edit/:type/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image_1', maxCount: 1 }, { name: 'image_2', maxCount: 1 }]), async (req, res) => {
    const { type, id } = req.params;
    try {
        if (type === 'vehicles') {
            const { name, capacity, price } = req.body;
            if (req.files && req.files['image']) {
                await pool.query('UPDATE vehicles SET name=?, capacity=?, price=?, image=? WHERE id=?', [name, capacity, parseInt(price), '/uploads/' + req.files['image'][0].filename, id]);
            } else {
                await pool.query('UPDATE vehicles SET name=?, capacity=?, price=? WHERE id=?', [name, capacity, parseInt(price), id]);
            }
        } else if (type === 'intercity') {
            const { name, route_desc, price } = req.body;
            let query = 'UPDATE intercity SET name=?, route_desc=?, price=?';
            let params = [name, route_desc, parseInt(price)];
            if (req.files && req.files['image_1']) { query += ', image_1=?'; params.push('/uploads/' + req.files['image_1'][0].filename); }
            if (req.files && req.files['image_2']) { query += ', image_2=?'; params.push('/uploads/' + req.files['image_2'][0].filename); }
            query += ' WHERE id=?';
            params.push(id);
            await pool.query(query, params);
        } else if (type === 'tourism') {
            const { name, duration, destinations, price } = req.body;
            let query = 'UPDATE tourism SET name=?, duration=?, destinations=?, price=?';
            let params = [name, duration, destinations, parseInt(price)];
            if (req.files && req.files['image_1']) { query += ', image_1=?'; params.push('/uploads/' + req.files['image_1'][0].filename); }
            if (req.files && req.files['image_2']) { query += ', image_2=?'; params.push('/uploads/' + req.files['image_2'][0].filename); }
            query += ' WHERE id=?';
            params.push(id);
            await pool.query(query, params);
        }
        res.redirect('/admin');
    } catch (e) {
        console.error(e);
        res.status(500).send("Error updating record");
    }
});

module.exports = router;
