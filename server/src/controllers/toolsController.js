const jwt = require('jsonwebtoken');
const ApiCollection = require('../models/ApiCollection');

// @route   POST /api/tools/jwt/verify
// @desc    Verify a JWT using a provided secret
// @access  Private

const getCollections = async (req, res) => {
    const collections = await ApiCollection.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: collections });
};

const createCollection = async (req, res) => {
    const { name, requests } = req.body;
    const collection = await ApiCollection.create({
        user: req.user._id,
        name,
        requests
    });
    res.status(201).json({ success: true, data: collection });
};


const verifyJWT = async (req, res) => { 
    const { token, secret, algorithm }  = req.body;
    
    if(!token || !secret) {
        const error = new Error('Token and secret are required.');
        error.statusCode = 400;
        throw error;
    }

    try {
        const decoded = jwt.verify(token, secret, {
            algorithms : [algorithm || 'HS256'],
        });

        res.json({
            success : true,
            valid : true, 
            decoded, 
            message : 'Token signature is valid.',
        });
    }
    catch(err){
        
        res.json({
            success : true,
            valid : false,
            error : err.name, // 'JsonWebTokenError' | 'TokenExpiredError' | 'NotBeforeError'
            message : err.message,
            ...(err.expiredAt && { expiredAt : err.expiredAt }),
        });
    }
};

module.exports = { verifyJWT, getCollections, createCollection };