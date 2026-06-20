const jwt = require('jsonwebtoken');

// @route   POST /api/tools/jwt/verify
// @desc    Verify a JWT using a provided secret
// @access  Private

const verifyJWT = async (req, res) => { 
    const { token, secret, algorithm }  = req.body;
    
    if(!token || !secret) {
        const error = new Error('Token and secret are required.');
        error.statusCode = 400;
        throw error;
    }

    try {
        const decode = jwt.verify(token, secret, {
            algorithms : [algorithm || 'HS256'],
        });

        res.join({
            success : true,
            valid : true, 
            decode, 
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

module.exports = { verifyJWT };