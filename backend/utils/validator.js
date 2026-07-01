// Validation utilities

// Validate email
function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number
function isValidPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    return phoneRegex.test(phone);
}

// Validate URL
function isValidURL(url) {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Validate date
function isValidDate(date) {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
}

// Validate number
function isValidNumber(value, min = null, max = null) {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

// Validate string length
function isValidLength(value, min = null, max = null) {
    if (typeof value !== 'string') return false;
    if (min !== null && value.length < min) return false;
    if (max !== null && value.length > max) return false;
    return true;
}

// Validate contains only alphabets
function isAlpha(value) {
    if (!value) return false;
    return /^[a-zA-Z\s]+$/.test(value);
}

// Validate contains only alphanumeric
function isAlphanumeric(value) {
    if (!value) return false;
    return /^[a-zA-Z0-9\s]+$/.test(value);
}

// Validate contains only numbers
function isNumeric(value) {
    if (!value) return false;
    return /^\d+$/.test(value);
}

// Validate JSON
function isValidJSON(str) {
    if (!str) return false;
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

// Validate boolean
function isValidBoolean(value) {
    return value === true || value === false || value === 'true' || value === 'false' || value === 1 || value === 0;
}

// Validate object properties
function validateObject(obj, schema) {
    const errors = {};
    let isValid = true;
    
    for (const [key, rules] of Object.entries(schema)) {
        const value = obj[key];
        const fieldErrors = [];
        
        if (rules.required && (value === undefined || value === null || value === '')) {
            fieldErrors.push('Field is required');
            errors[key] = fieldErrors;
            isValid = false;
            continue;
        }
        
        if (value === undefined || value === null || value === '') {
            continue; // Skip optional empty fields
        }
        
        if (rules.type === 'email' && !isValidEmail(value)) {
            fieldErrors.push('Invalid email format');
        }
        
        if (rules.type === 'phone' && !isValidPhone(value)) {
            fieldErrors.push('Invalid phone format');
        }
        
        if (rules.type === 'url' && !isValidURL(value)) {
            fieldErrors.push('Invalid URL format');
        }
        
        if (rules.type === 'date' && !isValidDate(value)) {
            fieldErrors.push('Invalid date format');
        }
        
        if (rules.type === 'number' && !isValidNumber(value, rules.min, rules.max)) {
            fieldErrors.push('Invalid number');
        }
        
        if (rules.type === 'alpha' && !isAlpha(value)) {
            fieldErrors.push('Only alphabets allowed');
        }
        
        if (rules.type === 'alphanumeric' && !isAlphanumeric(value)) {
            fieldErrors.push('Only alphanumeric characters allowed');
        }
        
        if (rules.type === 'numeric' && !isNumeric(value)) {
            fieldErrors.push('Only numbers allowed');
        }
        
        if (rules.type === 'boolean' && !isValidBoolean(value)) {
            fieldErrors.push('Invalid boolean value');
        }
        
        if (rules.minLength && value.length < rules.minLength) {
            fieldErrors.push(`Minimum ${rules.minLength} characters required`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            fieldErrors.push(`Maximum ${rules.maxLength} characters allowed`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            fieldErrors.push('Invalid format');
        }
        
        if (rules.values && !rules.values.includes(value)) {
            fieldErrors.push(`Must be one of: ${rules.values.join(', ')}`);
        }
        
        if (fieldErrors.length > 0) {
            errors[key] = fieldErrors;
            isValid = false;
        }
    }
    
    return { isValid, errors };
}

// Sanitize string (remove dangerous characters)
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/[<>]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Escape HTML
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Validate password
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidURL,
    isValidDate,
    isValidNumber,
    isValidLength,
    isAlpha,
    isAlphanumeric,
    isNumeric,
    isValidJSON,
    isValidBoolean,
    validateObject,
    sanitizeString,
    escapeHTML,
    validatePassword
};