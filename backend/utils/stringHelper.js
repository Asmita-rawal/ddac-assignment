// String helper utilities

// Truncate string
function truncate(str, maxLength = 100, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + suffix;
}

// Capitalize first letter
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Capitalize all words
function capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}

// Convert to slug
function slugify(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Convert to camelCase
function toCamelCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

// Convert to snake_case
function toSnakeCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Convert to kebab-case
function toKebabCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Convert to PascalCase
function toPascalCase(str) {
    if (!str) return '';
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Extract initials
function getInitials(str) {
    if (!str) return '';
    return str
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
}

// Remove extra spaces
function removeExtraSpaces(str) {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
}

// Count words
function wordCount(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).length;
}

// Truncate by words
function truncateWords(str, wordLimit = 20, suffix = '...') {
    if (!str) return '';
    const words = str.split(/\s+/);
    if (words.length <= wordLimit) return str;
    return words.slice(0, wordLimit).join(' ') + suffix;
}

// Generate random string
function randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate random alphanumeric
function randomAlphanumeric(length = 8) {
    return randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

// Generate random numeric
function randomNumeric(length = 6) {
    return randomString(length, '0123456789');
}

// Check if string is empty
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

// Check if string contains only whitespace
function isWhitespace(str) {
    if (!str) return true;
    return str.trim().length === 0;
}

// Escape special regex characters
function escapeRegex(str) {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mask sensitive data (email, phone, etc.)
function maskString(str, visibleStart = 2, visibleEnd = 2, maskChar = '*') {
    if (!str) return '';
    if (str.length <= visibleStart + visibleEnd) {
        return str;
    }
    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);
    return start + middle + end;
}

// Mask email
function maskEmail(email) {
    if (!email) return '';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const username = parts[0];
    const domain = parts[1];
    const maskedUsername = maskString(username, 2, 1);
    return `${maskedUsername}@${domain}`;
}

// Mask phone
function maskPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    const visible = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 4);
    return masked + visible;
}

// Check if string is valid JSON
function isJSON(str) {
    if (!str) return false;
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// Parse JSON safely
function safeJSONParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

module.exports = {
    truncate,
    capitalize,
    capitalizeWords,
    slugify,
    toCamelCase,
    toSnakeCase,
    toKebabCase,
    toPascalCase,
    getInitials,
    removeExtraSpaces,
    wordCount,
    truncateWords,
    randomString,
    randomAlphanumeric,
    randomNumeric,
    isEmpty,
    isWhitespace,
    escapeRegex,
    maskString,
    maskEmail,
    maskPhone,
    isJSON,
    safeJSONParse
};