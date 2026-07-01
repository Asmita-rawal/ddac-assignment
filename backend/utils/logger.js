const winston = require('winston');
const path = require('path');

// Configure Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'safetrack-api' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5
        })
    ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

// Create stream for Morgan
const stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

// Log middleware
const logMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
    });
    next();
};

// Log error
const logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        name: error.name
    };
    
    if (req) {
        errorLog.method = req.method;
        errorLog.url = req.url;
        errorLog.ip = req.ip;
        errorLog.userId = req.user ? req.user.userId : null;
    }
    
    logger.error(error.message, errorLog);
};

// Log info
const logInfo = (message, data = null) => {
    logger.info(message, data);
};

// Log warning
const logWarning = (message, data = null) => {
    logger.warn(message, data);
};

// Log debug
const logDebug = (message, data = null) => {
    logger.debug(message, data);
};

// Log HTTP request
const logHTTP = (message, data = null) => {
    logger.http(message, data);
};

module.exports = {
    logger,
    stream,
    logMiddleware,
    logError,
    logInfo,
    logWarning,
    logDebug,
    logHTTP,
    levels
};