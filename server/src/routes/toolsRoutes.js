const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../controllers/toolsController')

router.post('/jwt/verify', verifyJWT);

module.exports = router;
