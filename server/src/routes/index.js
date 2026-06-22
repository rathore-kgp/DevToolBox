const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const toolsRoutes = require('./toolsRoutes');
const { protect } = require('../middleware/authMiddleware');

router.use('/tools', protect, toolsRoutes); 
router.use('/auth', authRoutes);
//Future routes can be added here

module.exports = { routes: router };