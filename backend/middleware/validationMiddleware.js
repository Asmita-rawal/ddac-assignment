const { validationError } = require('../utils/response');

// Validation rules for different entities
const validationRules = {
    user: {
        name: { required: true, minLength: 2, maxLength: 100 },
        email: { required: true, type: 'email' },
        password: { required: true, minLength: 6 },
        phone: { type: 'phone', optional: true },
        role: { values: ['caregiver', 'community', 'admin'], optional: true }
    },
    elderly: {
        name: { required: true, minLength: 2, maxLength: 100 },
        age: { type: 'number', min: 1, max: 150, optional: true },
        gender: { values: ['Male', 'Female', 'Other'], optional: true },
        medical_condition: { maxLength: 500, optional: true },
        emergency_contact_name: { maxLength: 100, optional: true },
        emergency_contact_phone: { type: 'phone', optional: true }
    },
    report: {
        profile_id: { required: true, type: 'number' },
        last_seen_location: { required: true, maxLength: 255 },
        missing_date: { required: true, type: 'date' },
        description: { maxLength: 1000, optional: true },
        priority: { values: ['low', 'medium', 'high', 'critical'], optional: true }
    },
    sighting: {
        report_id: { required: true, type: 'number' },
        location: { required: true, maxLength: 255 },
        sighting_date: { required: true, type: 'date' },
        description: { maxLength: 1000, optional: true },
        reporter_name: { maxLength: 100, optional: true },
        reporter_email: { type: 'email', optional: true },
        reporter_phone: { type: 'phone', optional: true }
    }
};

// Validate a single field
const validateField = (value, rules) => {
    const errors = [];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push('This field is required');
        return errors;
    }
    
    if (value === undefined || value === null || value === '') {
        return errors; // Skip optional empty fields
    }
    
    // Type validation
    if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('Invalid email format');
    }
    
    if (rules.type === 'phone' && !/^[\d\s\-+()]{10,15}$/.test(value)) {
        errors.push('Invalid phone number format');
    }
    
    if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
            errors.push('Must be a number');
        } else {
            if (rules.min !== undefined && num < rules.min) {
                errors.push(`Must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && num > rules.max) {
                errors.push(`Must be at most ${rules.max}`);
            }
        }
    }
    
    if (rules.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            errors.push('Invalid date format');
        }
    }
    
    // Length validation
    if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`Must be at least ${rules.minLength} characters`);
    }
    
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`Must be at most ${rules.maxLength} characters`);
    }
    
    // Value validation
    if (rules.values && !rules.values.includes(value)) {
        errors.push(`Must be one of: ${rules.values.join(', ')}`);
    }
    
    return errors;
};

// Validate object against rules
const validate = (rules) => {
    return (req, res, next) => {
        const data = { ...req.body, ...req.params, ...req.query };
        const errors = {};
        let hasErrors = false;
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const fieldErrors = validateField(value, fieldRules);
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                hasErrors = true;
            }
        }
        
        if (hasErrors) {
            return validationError(res, errors);
        }
        
        next();
    };
};

// Sanitize input (remove dangerous characters)
const sanitize = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Sanitize request body
const sanitizeBody = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        }
    }
    next();
};

// Check for SQL injection patterns
const hasSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    const patterns = [
        /(\bSELECT\b.*\bFROM\b)/i,
        /(\bINSERT\b.*\bINTO\b)/i,
        /(\bUPDATE\b.*\bSET\b)/i,
        /(\bDELETE\b.*\bFROM\b)/i,
        /(\bDROP\b.*\bTABLE\b)/i,
        /(\bUNION\b.*\bSELECT\b)/i,
        /('.*OR.*'.*='.*')/i,
        /('.*AND.*'.*='.*')/i,
        /(\bEXEC\b)/i,
        /(\bXP_\w+\b)/i
    ];
    return patterns.some(pattern => pattern.test(value));
};

// Prevent SQL injection
const preventSQLInjection = (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    
    for (const key in data) {
        const value = data[key];
        if (typeof value === 'string' && hasSQLInjection(value)) {
            return error(res, 'Invalid input detected', 400);
        }
    }
    
    next();
};

// Pagination validation
const validatePagination = (req, res, next) => {
    let { page, limit } = req.query;
    
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100; // Max limit
    
    req.pagination = { page, limit };
    next();
};

// Custom validation for specific use cases
const validateMissingReport = (req, res, next) => {
    const { profile_id, last_seen_location, missing_date } = req.body;
    
    if (!profile_id) {
        return validationError(res, { profile_id: 'Profile ID is required' });
    }
    
    if (!last_seen_location) {
        return validationError(res, { last_seen_location: 'Last seen location is required' });
    }
    
    if (!missing_date) {
        return validationError(res, { missing_date: 'Missing date is required' });
    }
    
    // Check if missing_date is not in the future
    const date = new Date(missing_date);
    if (date > new Date()) {
        return validationError(res, { missing_date: 'Missing date cannot be in the future' });
    }
    
    next();
};

const validateSighting = (req, res, next) => {
    const { report_id, location, sighting_date } = req.body;
    
    if (!report_id) {
        return validationError(res, { report_id: 'Report ID is required' });
    }
    
    if (!location) {
        return validationError(res, { location: 'Location is required' });
    }
    
    if (!sighting_date) {
        return validationError(res, { sighting_date: 'Sighting date is required' });
    }
    
    // Check if sighting_date is not in the future
    const date = new Date(sighting_date);
    if (date > new Date()) {
        return validationError(res, { sighting_date: 'Sighting date cannot be in the future' });
    }
    
    next();
};

module.exports = {
    validate,
    validateField,
    sanitize,
    sanitizeBody,
    preventSQLInjection,
    validatePagination,
    validateMissingReport,
    validateSighting,
    validationRules
};