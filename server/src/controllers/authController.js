const User = require('../models/User');
const crypto = require('crypto');

// Helper : Send token response with HttpOnly cookie for refresh token
const sendTokenResponse = async (user, statusCode, res) => {
    const { accessToken, refreshToken } = user.generateTokenPair();

    const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    user.refreshTokens.push(hashedRefreshToken);

    //Keep only last refresh tokens
    if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,  //XSS protection
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', //CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 100,  // 7 days in ms
    };

    res
        .status(statusCode)
        .cookie('refreshToken', refreshToken, cookieOptions)
        .json({
            success: true,
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

};

//@route POST /api/auth/register
const register = async (req, res) => {
    const { username, email, password } = req.body;

    //Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
        const field = existingUser.email == email ? 'email' : 'username';
        const error = new Error(`An account with that ${field} already exists.`);

        error.statusCode = 409;
        throw error;
    }

    const user = await User.create({ username, email, password });

    await sendTokenResponse(user, 201, res);
};

// @route   POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Please provide email and password.');
    error.statusCode = 400;
    throw error;
  }

  // Must explicitly select password since `select: false` in schema
  const user = await User.findOne({ email }).select('+password +refreshTokens');

  if (!user || !(await user.matchPassword(password))) {
    // Deliberate vague message — don't reveal which field is wrong
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  await sendTokenResponse(user, 200, res);
};

// @route POST/api/auth/refresh
const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        const error = new Error('No refresh token provided.');
        error.statusCode = 401;
        throw error;
    }

    const jwt = require('jsonwebtoken');
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    catch (err) {
        const error = new Error('Invalid or expired refresh token');
        error.statusCode = 401;
        throw error;
    }

    // Hash the incoming for comparing 
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(hashedToken)) {
        //Token reuse detected! Invalidate ALL sessions (token rotation attack)
        if (user) {
            user.refreshTokens = [];
            await user.save({ validateBeforeSave: false });
        }

        const error = new Error('Token reuse detected. All sessions  invalidated.');
        error.statusCode = 401;
        throw error;
    }

    //Remove used refresh token (rotation: one-time-use);
    user.refreshTokens = user.refreshTokens.filter(t => t !== hashedToken);

    await sendTokenResponse(user, 200, res);
};



// @route POST /api/auth/logout
const logout = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (token) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findById(req.user.id).select('+refreshTokens');
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(t => t != hashedToken);
            await user.save({ validateBeforeSave: false });
        }
    }

    //Clear the cookie
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    res.json({
        success: true,
        message: 'Logged out successfully.'
    });

};



// @route GET /api/auth/me

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
};


module.exports = { register, login, refreshToken, logout, getMe };