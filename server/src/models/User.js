const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type : String, 
            required : [true, 'Username is required'],
            unique : true,
            trim : true,
            minLength : [3, 'Username must be at least 3 characters'],
            maxlength : [30, 'Username cannot  exceed 30 characters'],
            match : [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],    
        },

        email: {
            type : String, 
            required : [true, 'Email is required'],
            unique : true,
            lowercase : true, 
            trim : true,
            match : [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },

        password: {
            type : String, 
            required : [true, 'Password is required'],
            minlength : [8, 'Password must be at least 8 characters'],
            select : false,
        },

        refreshTokens: {
            type : [String],  //Array support multiple sessions
            select : false,
            default : [],
        },

        role: {
            type : String, 
            enum : ['user', 'admin'],
            default : 'user',
        },
    },

    {
        timestamps: true,
    }

);

//====== INDEXES ======

userSchema.index({ role : 1 });

//====== PRE-SAVE HOOK FOR PASSWORD HASHING ======

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//====== INSTANCE METHODS ======

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateTokenPair = function(){
    const jwt = require('jsonwebtoken');

    const payload = {
        id : this._id, 
        role : this.role 
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRE, 
    });

    const refreshToken = jwt.sign(
        { id : this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn : process.env.JWT_EXPIRE}
    );

    return { accessToken, refreshToken };;
};

module.exports = mongoose.model('User', userSchema);