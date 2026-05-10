const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rootpassword',
  database: process.env.DB_NAME || 'adago_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    // Note: If the database does not exist, creating the pool with 'database: adago_db' will fail.
    // So we connect without database to create it if it doesn't exist.
    let retries = 5;
    while (retries > 0) {
      try {
        const tempPool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASS || 'rootpassword',
        });
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'adago_db'}\``);
        await tempPool.end();
        break;
      } catch (err) {
        console.log(`Database not ready yet, retrying in 3 seconds... (${retries} attempts left)`);
        retries -= 1;
        await new Promise(res => setTimeout(res, 3000));
        if (retries === 0) throw err;
      }
    }

    console.log('Database adago_db created or already exists.');

    // Users table (Updated)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check and create initial admin user
    const bcrypt = require('bcrypt');
    const [adminRows] = await pool.query("SELECT * FROM `users` WHERE email = 'admin@adago.com'");
    if (adminRows.length === 0) {
      const hashedAdminPwd = await bcrypt.hash('admin123', 10);
      await pool.query("INSERT INTO users (username, email, password, role) VALUES ('Admin', 'admin@adago.com', ?, 'admin')", [hashedAdminPwd]);
    }

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        booking_ref VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(100) NOT NULL,
        detail VARCHAR(255) NOT NULL,
        price VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        passengers INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Menunggu Konfirmasi',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Vehicles table (for Dynamic Admin rendering)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        capacity VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        image VARCHAR(255) DEFAULT '/imagebooking2/Elf.jpg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Intercity table (Antar Kota)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS intercity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        route_desc VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        image_1 VARCHAR(255) DEFAULT '/imagebooking1/Blitar.jpg',
        image_2 VARCHAR(255) DEFAULT '/imagebooking1/Juanda.jpg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tourism table (Pariwisata)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tourism (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        destinations VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        image_1 VARCHAR(255) DEFAULT '/imagebooking3/Bali1.jpg',
        image_2 VARCHAR(255) DEFAULT '/imagebooking3/Bali2.jpg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [vRows] = await pool.query("SELECT * FROM vehicles");
    if (vRows.length === 0) {
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Elf', '19 seat', 750000, '/imagebooking2/Elf.jpg')");
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Toyota Innova', '6 orang', 700000, '/imagebooking2/Toyota-innova.jpg')");
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Toyota Hiace', '15 seat', 800000, '/imagebooking2/Toyota-hiace.jpg')");
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Daihatsu Xenia', '6 orang', 600000, '/imagebooking2/Daihatsu-xenia.jpg')");
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Avanza Fwo', '6 orang', 600000, '/imagebooking2/AvanzaFwo.jpg')");
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Calya', '6 orang', 500000, '/imagebooking2/Calya.jpg')");
    }

    const [iRows] = await pool.query("SELECT * FROM intercity");
    if (iRows.length === 0) {
      await pool.query("INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES ('BLITAR - JUANDA', 'Rute: Blitar ke Bandara Juanda Surabaya', 150000, '/imagebooking1/Blitar.jpg', '/imagebooking1/Juanda.jpg')");
      await pool.query("INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES ('BLITAR - KUDUS', 'Rute: Blitar ke Kudus', 350000, '/imagebooking1/Blitar.jpg', '/imagebooking1/Kudus.jpg')");
      await pool.query("INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES ('BLITAR - JAKARTA', 'Rute: Blitar ke Jakarta', 650000, '/imagebooking1/Blitar.jpg', '/imagebooking1/Jakarta.jpg')");
      await pool.query("INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES ('BLITAR - SURABAYA', 'Rute: Blitar ke Surabaya', 150000, '/imagebooking1/Blitar.jpg', '/imagebooking1/Surabaya.jpg')");
      await pool.query("INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES ('BLITAR - YOGYAKARTA', 'Rute: Blitar ke Yogyakarta', 230000, '/imagebooking1/Blitar.jpg', '/imagebooking1/Yogyakarta.jpg')");
      await pool.query("INSERT INTO intercity (name, route_desc, price, image_1, image_2) VALUES ('BLITAR - SEMARANG', 'Rute: Blitar ke Semarang', 350000, '/imagebooking1/Blitar.jpg', '/imagebooking1/Semarang.jpg')");
    }

    const [tRows] = await pool.query("SELECT * FROM tourism");
    if (tRows.length === 0) {
      await pool.query("INSERT INTO tourism (name, duration, destinations, price, image_1, image_2) VALUES ('Paket Bali', '3 Hari 2 Malam', 'Destinasi: Tanah Lot, Tanjungan Benoa, Pantai Melasti', 725000, '/imagebooking3/Bali1.jpg', '/imagebooking3/Bali2.jpg')");
      await pool.query("INSERT INTO tourism (name, duration, destinations, price, image_1, image_2) VALUES ('Paket Yogyakarta', '2 Hari 1 Malam', 'Destinasi: Pantai Indrayanti, Goa Pindul, Malioboro', 400000, '/imagebooking3/Yogyakarta1.jpg', '/imagebooking3/Yogyakarta2.jpg')");
      await pool.query("INSERT INTO tourism (name, duration, destinations, price, image_1, image_2) VALUES ('Paket Magetan', '1 Hari', 'Destinasi: Telaga Sarangan, Lawu Park, Oleh-Oleh Khas Magetan', 285000, '/imagebooking3/Magetan1.jpg', '/imagebooking3/Magetan2.jpg')");
      await pool.query("INSERT INTO tourism (name, duration, destinations, price, image_1, image_2) VALUES ('Paket Malang', '1 Hari', 'Destinasi: Jatim Park 3, Alun-Alun Kota Batu, Oleh-Oleh Khas Batu Malang', 365000, '/imagebooking3/Malang1.jpg', '/imagebooking3/Malang2.jpg')");
      await pool.query("INSERT INTO tourism (name, duration, destinations, price, image_1, image_2) VALUES ('Paket Ziarah Wali', '1 Hari', 'Destinasi: Sunan Ampel, Sunan Giri, Sunan Drajat, Sunan Bonang', 365000, '/imagebooking3/ZiarahWali1.jpg', '/imagebooking3/ZiarahWali2.jpg')");
    }

    console.log('Tables and seeds initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { pool, initDB };
