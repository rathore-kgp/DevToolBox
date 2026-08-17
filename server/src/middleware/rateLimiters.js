const rateLimit = require('express-rate-limit');

// Auth routes (register/login) — tight limit to slow down brute-force /
// credential-stuffing attempts. Keyed by IP.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

// Backend proxy (API Tester) — authenticated, but still bounded so a single
// account can't hammer arbitrary external hosts or exhaust server resources.
const proxyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,             // 30 proxied requests per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
});

module.exports = { authLimiter, proxyLimiter };
