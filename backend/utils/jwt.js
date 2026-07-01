const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'safetrack-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

// Generate JWT token
function generateToken(payload, expiresIn = JWT_EXPIRY) {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate token');
    }
}

// Generate refresh token
function generateRefreshToken(payload) {
    return generateToken(payload, JWT_REFRESH_EXPIRY);
}

// Verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

// Decode token without verification
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
}

// Get token from Authorization header
function getTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
}

// Get token from cookie
function getTokenFromCookie(req) {
    return req.cookies ? req.cookies.token || null : null;
}

// Refresh token
function refreshToken(oldToken) {
    try {
        const decoded = verifyToken(oldToken);
        // Remove exp and iat from payload
        const { exp, iat, ...payload } = decoded;
        return generateToken(payload);
    } catch (error) {
        console.error('Token refresh error:', error);
        throw new Error('Failed to refresh token');
    }
}

// Check if token is about to expire (within 5 minutes)
function isTokenExpiringSoon(token, minutes = 5) {
    try {
        const decoded = verifyToken(token);
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded.exp || 0;
        return (exp - now) < (minutes * 60);
    } catch (error) {
        return true;
    }
}

// Get token expiration time
function getTokenExpiry(token) {
    try {
        const decoded = verifyToken(token);
        return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
        return null;
    }
}

// Create token with specific audience and issuer
function createTokenWithOptions(payload, options = {}) {
    const { audience, issuer, expiresIn = JWT_EXPIRY } = options;
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn,
            audience: audience || 'safetrack-api',
            issuer: issuer || 'safetrack-backend'
        });
    } catch (error) {
        console.error('Token creation error:', error);
        throw new Error('Failed to create token');
    }
}

// Validate token with audience and issuer
function validateTokenWithOptions(token, options = {}) {
    const { audience, issuer } = options;
    try {
        return jwt.verify(token, JWT_SECRET, {
            audience: audience || 'safetrack-api',
            issuer: issuer || 'safetrack-backend'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

// Generate password reset token
function generateResetToken(userId, email) {
    return generateToken({
        userId,
        email,
        purpose: 'password-reset'
    }, '1h');
}

// Generate email verification token
function generateEmailVerificationToken(userId, email) {
    return generateToken({
        userId,
        email,
        purpose: 'email-verification'
    }, '7d');
}

// Generate API key (for external services)
function generateApiKey() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

// Hash API key for storage
function hashApiKey(apiKey) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Validate API key format
function validateApiKeyFormat(apiKey) {
    return /^[a-f0-9]{64}$/.test(apiKey);
}

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    getTokenFromHeader,
    getTokenFromCookie,
    refreshToken,
    isTokenExpiringSoon,
    getTokenExpiry,
    createTokenWithOptions,
    validateTokenWithOptions,
    generateResetToken,
    generateEmailVerificationToken,
    generateApiKey,
    hashApiKey,
    validateApiKeyFormat,
    JWT_SECRET,
    JWT_EXPIRY,
    JWT_REFRESH_EXPIRY
};