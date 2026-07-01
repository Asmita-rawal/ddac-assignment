const { sequelize, User } = require('../models');
require('dotenv').config();

const dummyUsers = [
  // Admins (2)
  {
    name: 'Super Admin',
    email: 'admin@safetrack.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0001',
    address: '123 Admin Street, City'
  },
  {
    name: 'System Manager',
    email: 'manager@safetrack.com',
    password: 'manager123',
    role: 'admin',
    phone: '555-0002',
    address: '456 Manager Ave, City'
  },

  // Caregivers (15)
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1001',
    address: '789 Care Lane, City'
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1002',
    address: '101 Care Street, City'
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1003',
    address: '202 Care Blvd, City'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1004',
    address: '303 Care Road, City'
  },
  {
    name: 'Emma Martinez',
    email: 'emma.martinez@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1005',
    address: '404 Care Drive, City'
  },
  {
    name: 'Frank Taylor',
    email: 'frank.taylor@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1006',
    address: '505 Care Lane, City'
  },
  {
    name: 'Grace Anderson',
    email: 'grace.anderson@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1007',
    address: '606 Care Street, City'
  },
  {
    name: 'Henry Thomas',
    email: 'henry.thomas@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1008',
    address: '707 Care Blvd, City'
  },
  {
    name: 'Irene Jackson',
    email: 'irene.jackson@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1009',
    address: '808 Care Road, City'
  },
  {
    name: 'James White',
    email: 'james.white@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1010',
    address: '909 Care Drive, City'
  },
  {
    name: 'Karen Harris',
    email: 'karen.harris@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1011',
    address: '1010 Care Lane, City'
  },
  {
    name: 'Leo Thompson',
    email: 'leo.thompson@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1012',
    address: '1111 Care Street, City'
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1013',
    address: '1212 Care Blvd, City'
  },
  {
    name: 'Nathan Robinson',
    email: 'nathan.robinson@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1014',
    address: '1313 Care Road, City'
  },
  {
    name: 'Olivia Clark',
    email: 'olivia.clark@care.com',
    password: 'care123',
    role: 'caregiver',
    phone: '555-1015',
    address: '1414 Care Drive, City'
  },

  // Community Members (35)
  {
    name: 'John Doe',
    email: 'john.doe@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2001',
    address: '15 Member Street, City'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2002',
    address: '25 Member Ave, City'
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2003',
    address: '35 Member Lane, City'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2004',
    address: '45 Member Road, City'
  },
  {
    name: 'Robert Davis',
    email: 'robert.davis@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2005',
    address: '55 Member Blvd, City'
  },
  {
    name: 'Patricia Miller',
    email: 'patricia.miller@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2006',
    address: '65 Member Drive, City'
  },
  {
    name: 'Charles Moore',
    email: 'charles.moore@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2007',
    address: '75 Member Street, City'
  },
  {
    name: 'Barbara Taylor',
    email: 'barbara.taylor@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2008',
    address: '85 Member Ave, City'
  },
  {
    name: 'Thomas Anderson',
    email: 'thomas.anderson@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2009',
    address: '95 Member Lane, City'
  },
  {
    name: 'Jennifer Thomas',
    email: 'jennifer.thomas@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2010',
    address: '105 Member Road, City'
  },
  {
    name: 'Christopher Jackson',
    email: 'christopher.jackson@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2011',
    address: '115 Member Blvd, City'
  },
  {
    name: 'Elizabeth White',
    email: 'elizabeth.white@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2012',
    address: '125 Member Drive, City'
  },
  {
    name: 'Daniel Harris',
    email: 'daniel.harris@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2013',
    address: '135 Member Street, City'
  },
  {
    name: 'Lisa Martin',
    email: 'lisa.martin@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2014',
    address: '145 Member Ave, City'
  },
  {
    name: 'Anthony Thompson',
    email: 'anthony.thompson@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2015',
    address: '155 Member Lane, City'
  },
  {
    name: 'Linda Garcia',
    email: 'linda.garcia@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2016',
    address: '165 Member Road, City'
  },
  {
    name: 'Mark Martinez',
    email: 'mark.martinez@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2017',
    address: '175 Member Blvd, City'
  },
  {
    name: 'Karen Robinson',
    email: 'karen.robinson@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2018',
    address: '185 Member Drive, City'
  },
  {
    name: 'Steven Clark',
    email: 'steven.clark@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2019',
    address: '195 Member Street, City'
  },
  {
    name: 'Nancy Rodriguez',
    email: 'nancy.rodriguez@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2020',
    address: '205 Member Ave, City'
  },
  {
    name: 'Paul Lewis',
    email: 'paul.lewis@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2021',
    address: '215 Member Lane, City'
  },
  {
    name: 'Betty Lee',
    email: 'betty.lee@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2022',
    address: '225 Member Road, City'
  },
  {
    name: 'Donald Walker',
    email: 'donald.walker@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2023',
    address: '235 Member Blvd, City'
  },
  {
    name: 'Susan Hall',
    email: 'susan.hall@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2024',
    address: '245 Member Drive, City'
  },
  {
    name: 'George Allen',
    email: 'george.allen@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2025',
    address: '255 Member Street, City'
  },
  {
    name: 'Dorothy Young',
    email: 'dorothy.young@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2026',
    address: '265 Member Ave, City'
  },
  {
    name: 'Kenneth Hernandez',
    email: 'kenneth.hernandez@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2027',
    address: '275 Member Lane, City'
  },
  {
    name: 'Helen King',
    email: 'helen.king@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2028',
    address: '285 Member Road, City'
  },
  {
    name: 'Edward Wright',
    email: 'edward.wright@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2029',
    address: '295 Member Blvd, City'
  },
  {
    name: 'Donna Lopez',
    email: 'donna.lopez@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2030',
    address: '305 Member Drive, City'
  },
  {
    name: 'Brian Hill',
    email: 'brian.hill@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2031',
    address: '315 Member Street, City'
  },
  {
    name: 'Margaret Scott',
    email: 'margaret.scott@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2032',
    address: '325 Member Ave, City'
  },
  {
    name: 'Ronald Green',
    email: 'ronald.green@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2033',
    address: '335 Member Lane, City'
  },
  {
    name: 'Sandra Adams',
    email: 'sandra.adams@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2034',
    address: '345 Member Road, City'
  },
  {
    name: 'Timothy Baker',
    email: 'timothy.baker@member.com',
    password: 'member123',
    role: 'member',
    phone: '555-2035',
    address: '355 Member Blvd, City'
  }
];

async function insertDummyData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    await User.sync({ force: true });
    console.log('✅ User table created');

    let insertedCount = 0;
    for (const userData of dummyUsers) {
      try {
        await User.create(userData);
        insertedCount++;
        console.log(`✅ Created: ${userData.name} (${userData.role})`);
      } catch (error) {
        console.error(`❌ Failed to create ${userData.name}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully inserted ${insertedCount} users`);
    console.log(`📊 Database now has ${await User.count()} total users`);

    const stats = {
      total: await User.count(),
      admins: await User.count({ where: { role: 'admin' } }),
      caregivers: await User.count({ where: { role: 'caregiver' } }),
      members: await User.count({ where: { role: 'member' } })
    };
    console.log('\n📊 User Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Admins: ${stats.admins}`);
    console.log(`   Caregivers: ${stats.caregivers}`);
    console.log(`   Members: ${stats.members}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
}

insertDummyData();