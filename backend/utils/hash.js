const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// Hash password
async function hashPassword(password) {
    if (!password) {
        throw new Error('Password is required');
    }
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        return bcrypt.hash(password, salt);
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
}

// Compare password with hash
async function comparePassword(password, hashedPassword) {
    if (!password || !hashedPassword) {
        return false;
    }
    try {
        return bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
}

// Generate random password
function generateRandomPassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Generate secure random token
function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// Generate OTP (One-Time Password)
function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return otp;
}

// Validate password strength
function validatePasswordStrength(password) {
    const errors = [];
    const strength = {
        score: 0,
        isValid: false,
        errors: []
    };
    
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    } else {
        strength.score += 1;
    }
    
    if (password.length >= 10) {
        strength.score += 1;
    }
    
    if (/[a-z]/.test(password)) {
        strength.score += 1;
    } else {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (/[A-Z]/.test(password)) {
        strength.score += 1;
    } else {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (/[0-9]/.test(password)) {
        strength.score += 1;
    } else {
        errors.push('Password must contain at least one number');
    }
    
    if (/[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]/.test(password)) {
        strength.score += 1;
    } else {
        errors.push('Password must contain at least one special character');
    }
    
    strength.errors = errors;
    strength.isValid = errors.length === 0;
    
    return strength;
}

// Get password strength label
function getPasswordStrengthLabel(strengthScore) {
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 3) return 'Fair';
    if (strengthScore <= 4) return 'Good';
    if (strengthScore <= 5) return 'Strong';
    return 'Very Strong';
}

// Hash string (for general hashing)
function hashString(text, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(text).digest('hex');
}

// Generate salt
function generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

// Create HMAC
function createHMAC(text, secret, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, secret).update(text).digest('hex');
}

// Verify HMAC
function verifyHMAC(text, hmac, secret, algorithm = 'sha256') {
    const computed = createHMAC(text, secret, algorithm);
    return computed === hmac;
}

// Encrypt text (for sensitive data)
function encryptText(text, secret) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt text
function decryptText(encryptedText, secret) {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {
    hashPassword,
    comparePassword,
    generateRandomPassword,
    generateSecureToken,
    generateOTP,
    validatePasswordStrength,
    getPasswordStrengthLabel,
    hashString,
    generateSalt,
    createHMAC,
    verifyHMAC,
    encryptText,
    decryptText,
    SALT_ROUNDS
};