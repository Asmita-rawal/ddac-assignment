// Export all middleware
const auth = require('./authMiddleware');
const upload = require('./uploadMiddleware');
const validation = require('./validationMiddleware');
const error = require('./errorMiddleware');
const cors = require('./corsMiddleware');
const logging = require('./loggingMiddleware');
const cache = require('./cacheMiddleware');

module.exports = {
    auth,
    upload,
    validation,
    error,
    cors,
    logging,
    cache
};