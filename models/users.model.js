const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,' Please enter your name!']
    },
    email:{
        type:String,
        required: [true,'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide your email']
    },
    age:{
        type:Number,
    },
    password:{
        type: String,
        required: [true,'Please provide your password!'],
        minlength: 8,
        select: false
    },
    passwordConfirm:{
        type: String,
        required: [true, 'Please confirm your password'],
        validate:{
                validator: function(el){
                    return el === this.password
                },
                message: 'Passwords are not the same!'
        }
    },
    passwordAttemptedAt:{
        type: Date,
    },
    incorrectPasswordAttempt: {
        type: Number,
        default:0,
    },

})

//Saves hash of password and undefines confirmPassword field

userSchema.pre('save', async function(next){
    //Only run this function if password was actually modified
    if(!this.isModified('password')) return next()

    const salt = await bcrypt.genSalt(10)
    //Hash
    this.password = await bcrypt.hash(this.password, salt)

    //delete confirmPassword field
    this.passwordConfirm = undefined
    next()

})

//passwordChangedAt field 

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false} })
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword)
{
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.createToken = async function(id){
    const token = await jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
}


module.exports = mongoose.model('User', userSchema)