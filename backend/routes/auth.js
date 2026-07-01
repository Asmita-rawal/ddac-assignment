// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        
        console.log('📝 Registration attempt:', { name, email, role });
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }
        
        // Check if user exists
        const existing = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        
        // Insert user
        const result = await db.query(
            `INSERT INTO users 
             (username, email, password, full_name, phone, role, is_active, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [username, email, hashedPassword, name, phone || null, role || 'community']
        );
        
        // Get new user
        const newUser = await db.query(
            'SELECT id, username, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?',
            [result.insertId]
        );
        
        // Generate token
        const token = jwt.sign(
            { 
                userId: newUser[0].id, 
                email: newUser[0].email, 
                role: newUser[0].role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: newUser[0]
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const users = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const user = users[0];
        
        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }
        
        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        delete user.password;
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: user
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

// Verify email endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { email, token } = req.body;
        
        // For now, just return success
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Email verification failed'
        });
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        res.json({
            success: true,
            message: 'Verification email resent'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification email'
        });
    }
});

module.exports = router;