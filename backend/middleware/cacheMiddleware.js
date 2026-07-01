const NodeCache = require('node-cache');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
});

// Cache middleware
const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests or authenticated requests
        if (req.method !== 'GET' || req.user) {
            return next();
        }
        
        // Create cache key from URL and query params
        const key = `cache:${req.originalUrl}`;
        const cachedData = cache.get(key);
        
        if (cachedData) {
            // Send cached response
            return res.json(cachedData);
        }
        
        // Store original send function
        const originalSend = res.json;
        res.json = function(data) {
            // Cache the response
            if (res.statusCode === 200) {
                cache.set(key, data, duration);
            }
            return originalSend.call(this, data);
        };
        
        next();
    };
};

// Clear cache for specific pattern
const clearCache = (pattern) => {
    const keys = cache.keys();
    const matchedKeys = keys.filter(key => key.includes(pattern));
    
    for (const key of matchedKeys) {
        cache.del(key);
    }
};

// Clear all cache
const clearAllCache = () => {
    cache.flushAll();
};

// Get cache stats
const getCacheStats = () => {
    return {
        keys: cache.keys().length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        ksize: cache.getStats().ksize,
        vsize: cache.getStats().vsize
    };
};

// Cache specific data
const setCache = (key, data, ttl = 300) => {
    cache.set(key, data, ttl);
};

// Get cached data
const getCache = (key) => {
    return cache.get(key);
};

// Delete cached data
const deleteCache = (key) => {
    cache.del(key);
};

module.exports = {
    cache,
    cacheMiddleware,
    clearCache,
    clearAllCache,
    getCacheStats,
    setCache,
    getCache,
    deleteCache
};