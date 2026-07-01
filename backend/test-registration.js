// backend/test-registration.js
const db = require('./config/database');
const bcrypt = require('bcrypt');
const axios = require('axios');

async function testRegistration() {
    console.log('🔍 TESTING REGISTRATION SYSTEM\n');
    console.log('='.repeat(60));

    // ========================================
    // TEST 1: Database Connection
    // ========================================
    console.log('\n📌 TEST 1: Database Connection');
    try {
        const connected = await db.testConnection();
        if (connected) {
            console.log('✅ Database connected successfully');
        } else {
            console.log('❌ Database connection failed');
            return;
        }
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        return;
    }

    // ========================================
    // TEST 2: Check Users Table
    // ========================================
    console.log('\n📌 TEST 2: Users Table');
    try {
        const tables = await db.query("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            console.log('✅ Users table exists');
            
            const count = await db.query('SELECT COUNT(*) as total FROM users');
            console.log(`📊 Total users in database: ${count[0].total}`);
        } else {
            console.log('❌ Users table does not exist!');
            console.log('   Please run: npm run schema');
            return;
        }
    } catch (error) {
        console.log('❌ Error checking table:', error.message);
        return;
    }

    // ========================================
    // TEST 3: API Server Health
    // ========================================
    console.log('\n📌 TEST 3: API Server Health');
    try {
        const health = await axios.get('http://localhost:5001/api/health');
        if (health.data.status === 'OK') {
            console.log('✅ API server is running');
        } else {
            console.log('❌ API server is not responding correctly');
            console.log('   Please start server with: npm run dev');
            return;
        }
    } catch (error) {
        console.log('❌ API server is not running!');
        console.log('   Please start server with: npm run dev');
        console.log('   Error:', error.message);
        return;
    }

    // ========================================
    // TEST 4: Registration API
    // ========================================
    console.log('\n📌 TEST 4: Registration API');
    
    const timestamp = Date.now();
    const testUser = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'Test@123',
        phone: '+1-555-123-4567',
        role: 'caregiver'
    };

    console.log(`   Testing with: ${testUser.email}`);

    try {
        const response = await axios.post('http://localhost:5001/api/auth/register', testUser);
        
        if (response.data.success) {
            console.log('✅ Registration API successful!');
            console.log(`   User ID: ${response.data.user.id}`);
            console.log(`   Username: ${response.data.user.username}`);
            console.log(`   Email: ${response.data.user.email}`);
            console.log(`   Role: ${response.data.user.role}`);
            console.log(`   Token: ${response.data.token.substring(0, 30)}...`);
            
            // Store the user ID for later tests
            global.testUserId = response.data.user.id;
            global.testEmail = testUser.email;
        } else {
            console.log('❌ Registration API failed:', response.data.message);
        }
    } catch (error) {
        if (error.response) {
            console.log('❌ Registration API failed:');
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Registration API error:', error.message);
        }
    }

    // ========================================
    // TEST 5: Check Database for New User
    // ========================================
    console.log('\n📌 TEST 5: Verify User in Database');
    try {
        const users = await db.query(
            'SELECT id, username, email, full_name, phone, role, is_active, created_at FROM users WHERE email = ?',
            [testUser.email]
        );
        
        if (users.length > 0) {
            console.log('✅ User found in database!');
            console.log(`   ID: ${users[0].id}`);
            console.log(`   Username: ${users[0].username}`);
            console.log(`   Full Name: ${users[0].full_name}`);
            console.log(`   Email: ${users[0].email}`);
            console.log(`   Phone: ${users[0].phone}`);
            console.log(`   Role: ${users[0].role}`);
            console.log(`   Active: ${users[0].is_active ? 'Yes' : 'No'}`);
            console.log(`   Created: ${users[0].created_at}`);
        } else {
            console.log('❌ User NOT found in database');
        }
    } catch (error) {
        console.log('❌ Error checking database:', error.message);
    }

    // ========================================
    // TEST 6: Login API
    // ========================================
    console.log('\n📌 TEST 6: Login API');
    try {
        const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
            email: testUser.email,
            password: 'Test@123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Login successful!');
            console.log(`   User: ${loginResponse.data.user.full_name}`);
            console.log(`   Role: ${loginResponse.data.user.role}`);
            console.log(`   Token: ${loginResponse.data.token.substring(0, 30)}...`);
        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }
    } catch (error) {
        if (error.response) {
            console.log('❌ Login failed:');
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Login error:', error.message);
        }
    }

    // ========================================
    // TEST 7: Admin Login (Seeded User)
    // ========================================
    console.log('\n📌 TEST 7: Admin Login (Seeded User)');
    try {
        const adminLogin = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@safetrack.com',
            password: 'Admin@123'
        });
        
        if (adminLogin.data.success) {
            console.log('✅ Admin login successful!');
            console.log(`   User: ${adminLogin.data.user.full_name}`);
            console.log(`   Role: ${adminLogin.data.user.role}`);
        } else {
            console.log('❌ Admin login failed');
            console.log('   Make sure seed.sql was executed with real bcrypt hashes');
        }
    } catch (error) {
        if (error.response) {
            console.log('❌ Admin login failed:');
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data.message}`);
            console.log('\n💡 TIP: Admin login failing might mean:');
            console.log('   1. Seed data not loaded');
            console.log('   2. Wrong password in seed file');
            console.log('   3. bcrypt hashes are placeholders (need real ones)');
        } else {
            console.log('❌ Admin login error:', error.message);
        }
    }

    // ========================================
    // TEST 8: Recent Users List
    // ========================================
    console.log('\n📌 TEST 8: Recent Users in Database');
    try {
        const recentUsers = await db.query(
            'SELECT id, username, email, full_name, role, created_at FROM users ORDER BY id DESC LIMIT 5'
        );
        
        if (recentUsers.length > 0) {
            console.log(`📊 ${recentUsers.length} most recent users:`);
            console.log('-'.repeat(60));
            recentUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.full_name} (${user.email})`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Created: ${user.created_at}`);
                console.log('-'.repeat(60));
            });
        } else {
            console.log('❌ No users found in database');
        }
    } catch (error) {
        console.log('❌ Error fetching users:', error.message);
    }

    // ========================================
    // TEST 9: Password Hash Verification
    // ========================================
    console.log('\n📌 TEST 9: Password Hash Verification');
    try {
        const user = await db.query(
            'SELECT password FROM users WHERE email = ?',
            [testUser.email]
        );
        
        if (user.length > 0) {
            const isMatch = await bcrypt.compare('Test@123', user[0].password);
            console.log(`✅ Password hash verification: ${isMatch ? 'PASSED' : 'FAILED'}`);
            
            if (!isMatch) {
                console.log('   ⚠️ Password hash does not match!');
                console.log('   This means the hash in database is not valid');
            }
        } else {
            console.log('❌ User not found to verify password');
        }
    } catch (error) {
        console.log('❌ Error verifying password:', error.message);
    }

    // ========================================
    // TEST 10: Check Seeded Users
    // ========================================
    console.log('\n📌 TEST 10: Seeded Users');
    try {
        const seededUsers = await db.query(
            'SELECT username, email, role FROM users WHERE role IN ("admin", "caregiver", "community") LIMIT 5'
        );
        
        if (seededUsers.length > 0) {
            console.log('✅ Seeded users found:');
            seededUsers.forEach(user => {
                console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
            });
        } else {
            console.log('⚠️ No seeded users found. Did you run seed.sql?');
        }
    } catch (error) {
        console.log('❌ Error checking seeded users:', error.message);
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('\n💡 Next Steps:');
    console.log('1. Open register.html in your browser');
    console.log('2. Fill out the registration form');
    console.log('3. Submit and check if user appears in database');
    console.log('4. Try logging in with the new credentials');
    console.log('\n📝 To check users in database:');
    console.log('   mysql -u root -p');
    console.log('   USE safetrack_db;');
    console.log('   SELECT * FROM users ORDER BY id DESC;');
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ TEST COMPLETED');
    console.log('='.repeat(60));
}

// ========================================
// RUN THE TEST
// ========================================
testRegistration().catch(console.error);