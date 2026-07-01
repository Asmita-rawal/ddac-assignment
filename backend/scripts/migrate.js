const { connectDB, sequelize } = require('../config/db');
const { User, Elderly, Report, Sighting } = require('../models');
const bcrypt = require('bcryptjs');

async function migrate() {
    try {
        console.log('🔄 Starting database migration...');
        console.log('📊 Creating tables: users, elderly, reports, sightings');
        
        await connectDB();
        
        // Force sync (drops and recreates tables)
        await sequelize.sync({ force: true });
        console.log('✅ Database synchronized - tables created');
        
        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@safetrack.com',
            password: adminPassword,
            role: 'admin',
            isVerified: true
        });
        console.log('✅ Admin user created');
        console.log('   Email: admin@safetrack.com');
        console.log('   Password: admin123');
        
        // Create demo caregiver
        const demoPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Demo Caregiver',
            email: 'demo@safetrack.com',
            password: demoPassword,
            role: 'caregiver',
            isVerified: true
        });
        console.log('✅ Demo caregiver created');
        console.log('   Email: demo@safetrack.com');
        console.log('   Password: password123');
        
        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

migrate();