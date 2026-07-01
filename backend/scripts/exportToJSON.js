const { sequelize, User } = require('../models');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function exportToJSON() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'phone', 'address', 'isActive', 'createdAt'],
      order: [['id', 'ASC']]
    });

    const userData = users.map(user => user.toJSON());

    const admins = userData.filter(u => u.role === 'admin');
    const caregivers = userData.filter(u => u.role === 'caregiver');
    const members = userData.filter(u => u.role === 'member');

    const data = {
      totalUsers: userData.length,
      admins,
      caregivers,
      members,
      allUsers: userData
    };

    const dataDir = path.join(__dirname, '../../public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const files = [
      { name: 'all-users.json', content: data.allUsers },
      { name: 'admins.json', content: data.admins },
      { name: 'caregivers.json', content: data.caregivers },
      { name: 'members.json', content: data.members },
      { name: 'dashboard-stats.json', content: {
          totalUsers: data.totalUsers,
          totalAdmins: data.admins.length,
          totalCaregivers: data.caregivers.length,
          totalMembers: data.members.length,
          lastUpdated: new Date().toISOString()
        }
      }
    ];

    for (const file of files) {
      const filePath = path.join(dataDir, file.name);
      fs.writeFileSync(filePath, JSON.stringify(file.content, null, 2));
      console.log(`✅ Created: ${file.name}`);
    }

    console.log(`\n✅ All JSON files exported successfully to ${dataDir}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportToJSON();