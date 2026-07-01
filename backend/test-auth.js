// test-auth.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Try different connection configurations
const connectionConfigs = [
    { 
        name: 'No Password (XAMPP default)',
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'safetrack_db'
    },
    { 
        name: 'Password: root',
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'safetrack_db'
    },
    { 
        name: 'Password: password',
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'safetrack_db'
    },
    { 
        name: 'Password: 123456',
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'safetrack_db'
    }
];

async function testDatabaseConnections() {
    console.log('=== TESTING DATABASE CONNECTIONS ===\n');
    
    let successfulConnection = null;
    
    for (const config of connectionConfigs) {
        try {
            console.log(`Testing: ${config.name}`);
            const connection = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database,
                connectTimeout: 5000
            });
            
            // Test the connection
            const [result] = await connection.execute('SELECT 1 as test');
            console.log(`✅ SUCCESS! Connected with: ${config.name}`);
            console.log(`   Password: "${config.password}"\n`);
            
            successfulConnection = config;
            await connection.end();
            break; // Stop trying after successful connection
            
        } catch (error) {
            if (error.code === 'ER_ACCESS_DENIED_ERROR') {
                console.log(`❌ Access denied for: ${config.name}`);
            } else if (error.code === 'ER_BAD_DB_ERROR') {
                console.log(`❌ Database '${config.database}' doesn't exist`);
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
            console.log('');
        }
    }
    
    if (successfulConnection) {
        console.log('=' .repeat(50));
        console.log('✅ CONNECTION FOUND! Use these credentials:');
        console.log(`   User: ${successfulConnection.user}`);
        console.log(`   Password: "${successfulConnection.password}"`);
        console.log(`   Database: ${successfulConnection.database}`);
        return successfulConnection;
    } else {
        console.log('=' .repeat(50));
        console.log('❌ Could not connect with any configuration');
        console.log('\nTroubleshooting tips:');
        console.log('1. Make sure MySQL is running');
        console.log('2. Check if the database "safetrack_db" exists');
        console.log('3. If using XAMPP, the password is usually empty');
        console.log('4. If using MAMP, check the MAMP interface for credentials');
        console.log('5. Check your .env file for the correct password');
        return null;
    }
}

// Test bcrypt hashes
async function testHashes() {
    console.log('\n=== TESTING SEEDED PASSWORD HASHES ===\n');
    
    // These should match what's in your seed file
    const testCases = [
        { password: 'Admin@123', hash: '$2b$10$YK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z' },
        { password: 'Caregiver@123', hash: '$2b$10$XK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z' },
        { password: 'Community@123', hash: '$2b$10$ZK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z' }
    ];
    
    for (const test of testCases) {
        try {
            const result = await bcrypt.compare(test.password, test.hash);
            console.log(`Password "${test.password}" matches hash: ${result ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`Error testing "${test.password}": ${error.message}`);
        }
    }
}

// Test with successful connection
async function testWithConnection(config) {
    if (!config) return;
    
    console.log('\n=== TESTING DATABASE QUERIES ===\n');
    
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });
        
        // Check if users table exists
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'users'"
        );
        
        if (tables.length === 0) {
            console.log('❌ Users table does not exist! Run schema.sql first.');
            await connection.end();
            return;
        }
        
        // Count users
        const [userCount] = await connection.execute(
            'SELECT COUNT(*) as count FROM users'
        );
        console.log(`Total users in database: ${userCount[0].count}`);
        
        if (userCount[0].count > 0) {
            // Get user list
            const [users] = await connection.execute(
                'SELECT id, username, email, role, is_active, created_at FROM users LIMIT 5'
            );
            
            console.log('\nUsers in database:');
            users.forEach(user => {
                console.log(`  - ${user.username} (${user.email})`);
                console.log(`    Role: ${user.role}, Active: ${user.is_active ? 'Yes' : 'No'}`);
                console.log(`    Created: ${user.created_at}`);
            });
        } else {
            console.log('❌ No users found! Run seed.sql to populate data.');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('Database query error:', error.message);
    }
}

// Main function
async function runTests() {
    console.log('🔍 SAFETRACK AUTHENTICATION TEST\n');
    console.log('='.repeat(50));
    
    // First, find the correct database connection
    const config = await testDatabaseConnections();
    
    // Test password hashes
    await testHashes();
    
    // Test database queries if connection was successful
    if (config) {
        await testWithConnection(config);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ TESTS COMPLETED');
    
    if (!config) {
        console.log('\n⚠️ NEXT STEPS:');
        console.log('1. Check if MySQL is running:');
        console.log('   - Windows: services.msc -> MySQL');
        console.log('   - XAMPP: Open XAMPP Control Panel -> Start MySQL');
        console.log('   - MAMP: Open MAMP -> Start Servers');
        console.log('2. Create the database if it doesn\'t exist:');
        console.log('   CREATE DATABASE IF NOT EXISTS safetrack_db;');
        console.log('3. Check your .env file for correct database credentials');
    }
}

// Run the tests
runTests().catch(console.error);