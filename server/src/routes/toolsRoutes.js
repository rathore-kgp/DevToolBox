const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../controllers/toolsController')
const { proxyRequest } = require('../controllers/proxyController');
const { getCollections, createCollection } = require('../controllers/toolsController');
const { proxyLimiter } = require('../middleware/rateLimiters');

router.post('/proxy', proxyLimiter, proxyRequest);
router.get('/collections', getCollections);
router.post('/collections', createCollection);


router.post('/jwt/verify', verifyJWT);

module.exports = router;
