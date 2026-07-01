const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@Root_001646',
    database: process.env.DB_NAME || 'safetrack_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Convert to promise-based
const promisePool = pool.promise();

// Test connection function
async function testConnection() {
    try {
        const [rows] = await promisePool.query('SELECT 1+1 AS result');
        console.log('✅ Database connected successfully!');
        console.log('   Test result:', rows[0].result);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('   Error:', error.message);
        console.error('   Please check your .env file and MySQL service');
        return false;
    }
}

module.exports = {
    pool: promisePool,
    testConnection
};