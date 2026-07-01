const User = require('./models/User');
const Elderly = require('./models/Elderly');
const Report = require('./models/Report');
const Sighting = require('./models/Sighting');
const { pool } = require('./config/db');

async function testDataStorage() {
    console.log('🧪 Testing Data Storage...\n');

    try {
        // Check if test user already exists
        const existingUser = await User.findByEmail('test@caregiver.com');
        let userId;
        
        if (existingUser) {
            console.log('ℹ️ Test user already exists with ID:', existingUser.id);
            userId = existingUser.id;
        } else {
            console.log('📝 Creating new test user...');
            userId = await User.create({
                name: 'Test Caregiver',
                email: 'test@caregiver.com',
                password_hash: 'test_password_hash',
                phone: '+1234567890',
                role: 'caregiver'
            });
            console.log('✅ User created with ID:', userId);
        }

        // Check if elderly already exists
        const [elderlyCheck] = await pool.execute(
            'SELECT id FROM elderly WHERE name = ? AND user_id = ?',
            ['Robert Johnson', userId]
        );
        
        let elderlyId;
        if (elderlyCheck.length > 0) {
            console.log('ℹ️ Elderly already exists with ID:', elderlyCheck[0].id);
            elderlyId = elderlyCheck[0].id;
        } else {
            console.log('\n👴 Creating elderly person...');
            elderlyId = await Elderly.create({
                user_id: userId,
                name: 'Robert Johnson',
                age: 78,
                gender: 'Male',
                address: '123 Care Home, NYC',
                contact_person: 'Mary Johnson',
                contact_phone: '+0987654321',
                medical_conditions: 'Diabetes, Hypertension'
            });
            console.log('✅ Elderly created with ID:', elderlyId);
        }

        // Check if report already exists
        const [reportCheck] = await pool.execute(
            'SELECT id FROM reports WHERE elderly_id = ? AND description LIKE ?',
            [elderlyId, '%walk%']
        );
        
        let reportId;
        if (reportCheck.length > 0) {
            console.log('ℹ️ Report already exists with ID:', reportCheck[0].id);
            reportId = reportCheck[0].id;
        } else {
            console.log('\n📋 Creating report...');
            reportId = await Report.create({
                elderly_id: elderlyId,
                reporter_id: userId,
                report_type: 'missing',
                description: 'Robert went for a walk and didn\'t return',
                location: 'Central Park, NYC',
                priority: 'high'
            });
            console.log('✅ Report created with ID:', reportId);
        }

        console.log('\n🎉 Data storage test completed!');
        console.log('📊 Data summary:');
        console.log(`   User: ${userId}`);
        console.log(`   Elderly: ${elderlyId}`);
        console.log(`   Report: ${reportId}`);

        // Show all data
        console.log('\n📖 All users:');
        const users = await User.findAll();
        users.forEach(u => {
            console.log(`   - ${u.name} (${u.email})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

testDataStorage();