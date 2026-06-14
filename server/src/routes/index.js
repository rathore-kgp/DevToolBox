const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);
//Future routes can be added here

module.exports = { routes: router };