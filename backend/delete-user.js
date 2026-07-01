const { pool } = require('./config/db');

async function deleteUser() {
    try {
        const email = 'test@caregiver.com';
        
        // Check if user exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            // Delete user
            const [result] = await pool.execute(
                'DELETE FROM users WHERE email = ?',
                [email]
            );
            console.log(`✅ User with email ${email} deleted successfully`);
        } else {
            console.log(`ℹ️ User with email ${email} does not exist`);
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

deleteUser();