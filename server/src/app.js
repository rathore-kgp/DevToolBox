const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

require('express-async-errors');  


const { errorHandler, notFound } = require('./middleware/errorHandler');
const { routes } = require('./routes/index');

const createApp = () => {
    const app = express();

    app.use(helmet());
    app.use(cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
        credentials: true,
    }));

    app.use(cookieParser());
    app.use(express.json({ limit : '10mb' }));
    app.use(express.urlencoded({ extended : true }));

    //Logging (only in dev)
    if(process.env.NODE_ENV !== 'production'){
        app.use(morgan('dev'));
    }

    //helmet check endpoint
    app.get('/api/health', (req, res) => {
        res.json({ status : 'OK', timestamp : new Date().toISOString() });
    });

    //All API routes
    app.use('/api', routes);

    app.use(notFound);
    app.use(errorHandler);
    
    return app;
};

module.exports = createApp;