require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'safetrack_db',
    password: process.env.DB_PASSWORD || '@Root_001646',
    database: process.env.DB_NAME || 'safetrack'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        console.log('💡 Please check:');
        console.log('   1. MySQL is running (net start MySQL97)');
        console.log('   2. Credentials in .env file');
        console.log('   3. Database "safetrack" exists');
        return;
    }
    console.log('✅ Connected to MySQL database successfully!');
});

// ============================================================
// ===== TEST ENDPOINT =====
// ============================================================
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// ===== REGISTRATION ENDPOINT =====
// ============================================================
app.post('/api/auth/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').notEmpty().withMessage('Role is required')
], async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
        });
    }

    const { name, email, password, phone, role } = req.body;

    try {
        // Check if user already exists
        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            const insertQuery = `
                INSERT INTO users 
                (name, email, password, phone, role, security_question, security_answer, verified) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                name,
                email,
                hashedPassword,
                phone || null,
                role,
                'default',
                'default',
                1
            ];

            db.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create account: ' + err.message
                    });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { id: result.insertId, email: email },
                    process.env.JWT_SECRET || 'safetrack_secret_key_2024',
                    { expiresIn: '7d' }
                );

                res.status(201).json({
                    success: true,
                    message: 'Registration successful!',
                    token: token,
                    user: {
                        id: result.insertId,
                        name: name,
                        email: email,
                        role: role
                    }
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
});

// ============================================================
// ===== CHECK USER ENDPOINT =====
// ============================================================
app.get('/api/users/:email', (req, res) => {
    const email = req.params.email;
    db.query('SELECT id, name, email, role, verified FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: results[0] });
    });
});

// ============================================================
// ===== GET ALL USERS (for testing) =====
// ============================================================
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, email, role, verified, created_at FROM users ORDER BY id DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, users: results });
    });
});

// ============================================================
// ===== START SERVER =====
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Test: http://localhost:${PORT}/api/test`);
    console.log(`📝 Register: http://localhost:${PORT}/api/auth/register`);
    console.log(`👥 Users: http://localhost:${PORT}/api/users`);
    console.log(`✅ Press Ctrl+C to stop`);
});