// backend/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'safetrack',
    password: process.env.DB_PASSWORD || 'safetrack_password',
    database: process.env.DB_NAME || 'safetrack',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Execute query with parameters
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
}

// Get a connection from the pool
async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('Error getting connection:', error.message);
        throw error;
    }
}

// Close all connections
async function closePool() {
    try {
        await pool.end();
        console.log('✅ Database pool closed');
    } catch (error) {
        console.error('Error closing pool:', error.message);
    }
}

module.exports = {
    pool,
    query,
    getConnection,
    closePool,
    testConnection
};