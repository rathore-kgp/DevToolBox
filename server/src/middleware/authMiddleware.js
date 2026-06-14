const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async(req, res, next) => {
    let token;

    //Extraction from Authorization header 
    if(req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        const error = new Error('Not authorized, no token');
        error.statusCode = 401;
        return next(error);
    }
    
    // jwt.verify throws 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    req.user = await User.findById(decoded.id);
    
    if(!req.user) {
        const error = new Error('User belonging to this token no longer exists.');
        error.statusCode = 401;
        return next(error);
    }

    next();
};

//Role-base access control middleware factory
const authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            const error = new Error(`Role ${req.user.role} is not authorized to perform this action`);
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};


module.exports = { protect, authorize };