const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Write log to file
const writeLog = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };
    
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFile(logFile, logLine, (err) => {
        if (err) console.error('Failed to write log:', err);
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    const requestLog = {
        method: req.method,
        url: req.url,
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        userId: req.user ? req.user.userId : null,
        role: req.user ? req.user.role : null
    };
    
    writeLog(LOG_LEVELS.INFO, `Request: ${req.method} ${req.url}`, requestLog);
    
    // Capture response
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        const responseLog = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
        };
        
        writeLog(LOG_LEVELS.INFO, `Response: ${req.method} ${req.url}`, responseLog);
        
        return originalSend.call(this, data);
    };
    
    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    const errorLog = {
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user ? req.user.userId : null
    };
    
    writeLog(LOG_LEVELS.ERROR, `Error: ${err.message}`, errorLog);
    next(err);
};

// Performance logging
const performanceLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000) { // Log slow requests (> 1 second)
            writeLog(LOG_LEVELS.WARN, `Slow request: ${req.method} ${req.url}`, {
                duration: `${duration}ms`,
                status: res.statusCode
            });
        }
    });
    
    next();
};

// Activity logging (user actions)
const logActivity = (userId, action, details = null) => {
    writeLog(LOG_LEVELS.INFO, `Activity: ${action}`, {
        userId,
        action,
        details
    });
};

// Security logging
const logSecurity = (event, details = null) => {
    writeLog(LOG_LEVELS.WARN, `Security: ${event}`, details);
};

module.exports = {
    LOG_LEVELS,
    requestLogger,
    errorLogger,
    performanceLogger,
    logActivity,
    logSecurity,
    writeLog
};