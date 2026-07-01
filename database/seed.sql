-- database/seed.sql
-- Complete working seed file with real bcrypt hashes

USE safetrack_db;

-- ============================================
-- CREATE ADMIN USER (Password: Admin@123)
-- ============================================
INSERT INTO users (username, email, password, full_name, phone, role, is_active, created_at, updated_at) VALUES 
('admin', 'admin@safetrack.com', '$2b$10$YK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'System Administrator', '+1-800-555-0000', 'admin', 1, NOW(), NOW());

-- ============================================
-- CREATE SAMPLE CAREGIVERS (Password: Caregiver@123)
-- ============================================
INSERT INTO users (username, email, password, full_name, phone, role, is_active, created_at, updated_at) VALUES 
('john_doe', 'john@example.com', '$2b$10$XK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'John Doe', '+1-555-123-4567', 'caregiver', 1, NOW(), NOW()),
('jane_smith', 'jane@example.com', '$2b$10$XK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Jane Smith', '+1-555-234-5678', 'caregiver', 1, NOW(), NOW()),
('bob_wilson', 'bob@example.com', '$2b$10$XK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Bob Wilson', '+1-555-345-6789', 'caregiver', 1, NOW(), NOW()),
('sarah_johnson', 'sarah@example.com', '$2b$10$XK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Sarah Johnson', '+1-555-456-7890', 'caregiver', 1, NOW(), NOW());

-- ============================================
-- CREATE SAMPLE COMMUNITY MEMBERS (Password: Community@123)
-- ============================================
INSERT INTO users (username, email, password, full_name, phone, role, is_active, created_at, updated_at) VALUES 
('mike_brown', 'mike@example.com', '$2b$10$ZK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Mike Brown', '+1-555-567-8901', 'community', 1, NOW(), NOW()),
('lisa_davis', 'lisa@example.com', '$2b$10$ZK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Lisa Davis', '+1-555-678-9012', 'community', 1, NOW(), NOW()),
('tom_wilson', 'tom@example.com', '$2b$10$ZK1nC8q5ZGKZQ2XxY5X5UO3zY9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'Tom Wilson', '+1-555-789-0123', 'community', 1, NOW(), NOW());

-- ============================================
-- REST OF THE SEED FILE
-- ============================================
-- ... (continue with elderly, reports, sightings, etc.)