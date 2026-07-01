const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Testing MySQL Connection...');
console.log('📊 Database:', process.env.DB_NAME || 'safetrack_db');
console.log('🔌 Host:', process.env.DB_HOST || 'localhost');
console.log('👤 User:', process.env.DB_USER || 'root');
console.log('');

// Create connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root@2026',
    database: process.env.DB_NAME || 'safetrack_db',
    port: process.env.DB_PORT || 3306
});

// Connect
connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Is MySQL running?');
        console.log('   2. Check credentials in .env');
        console.log('   3. Verify database exists');
        console.log('   4. Run: net start MySQL80');
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL successfully!');
    
    // Get database info
    connection.query('SELECT DATABASE() as db', (err, results) => {
        if (!err) {
            console.log('   Current database:', results[0].db);
        }
        
        // Show tables
        connection.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.log('   No tables found or error:', err.message);
            } else if (results.length === 0) {
                console.log('   No tables found in database');
            } else {
                console.log('   Tables in database:');
                results.forEach(row => {
                    console.log(`     - ${Object.values(row)[0]}`);
                });
            }
            
            connection.end();
            console.log('\n✅ Database test completed!');
            console.log('🚀 Ready to start development.');
        });
    });
});