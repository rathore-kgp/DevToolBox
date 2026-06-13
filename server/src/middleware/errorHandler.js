const errorHandler = (err, req, res, next) => {
    //just logging for dev
    if(process.env.NODE_ENV !== 'production'){
        console.error(err.stack);
    }

    //Mongoose Validation Error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(e => e.messages);
        return res.status(400).json({
            success : false,
            error : "ValidationError",
            details : messages,
        });
    }

    //JWT Errors (handle centrally)
    if(err.name === 'JsonWebTokenError'){
        return res.status(401).json({ 
            success : false,
            error : 'INVALID TOKEN'
        });
    }
    if(err.name === 'TokenExpiredError'){
        return res.status(401).json({ 
            success : false,
            error : 'TOKEN EXPIRED'
        });
    }

    //Default: Internal Server Error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success : false,
        error : err.message || 'INTERNAL SERVER ERROR',
        ...(process.env.NODE_ENV !== 'production' && {stack : err.stack}), 
    });
};


const notFound = (req, res, next) => {
    const error = new Error('Route Not Found: ${req.originalUrl}');
    error.statusCode = 404;
    next(error);
};

module.exports = { errorHandler, notFound };