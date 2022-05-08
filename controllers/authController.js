const AppError = require('../utils/appError')
const User = require('../models/users.model')
const jwt = require('jsonwebtoken')

const MAX_PASSWORD_ATTEMPTS = 4;
const THIRTY_MINS =30*60*1000;

async function signUp(req, res){
    try {
    const {name, email, password, passwordConfirm} = req.body
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
      })

    const token = await newUser.createToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })

} catch(error) {
    res.status(400).json({
        status: 'Failed to create new User',
        message: error
        })
    }
}

async function login(req, res, next){
    try {
        const { email, password} = req.body

        if(!password || !email){
           return next(new AppError('Please provide email and passsword',400))
        }
        //find if user exist using email
        const user = await User.findOne({email}).select('+password +incorrectPasswordAttempt')
        
        //if no user found
        if(!user){
            return next(new AppError('No matching email found',404))
         }
         //incorret password attempts
         let incorrectPasswordAttempt = user.incorrectPasswordAttempt;
         //check if password is correct
         const isCorrect =  await user.correctPassword(password, user.password)
         //wrong password
         if(!isCorrect){
          const currentTime = Date.now();
          if(user.incorrectPasswordAttempt >= 4  && ( currentTime - user.passwordAttemptedAt) < THIRTY_MINS){
            res.status(401).json({
              status : "failed",
              message: `Incorrect Password, try after ${(currentTime - user.passwordAttemptedAt)/(1000*60)} minutes!!`
            })
          }
           //wrong password attempt 4 then set activate fiedls to false for 30 mins
           if(incorrectPasswordAttempt === MAX_PASSWORD_ATTEMPTS){
           const user2 = await User.findOneAndUpdate(
              {_id:user._id},
              {
                passwordAttemptedAt: Date.now(),                
              })
           }
           //update incorrect Password count
           const user3 = await User.findOneAndUpdate(
              {_id:user._id},
              {
                incorrectPasswordAttempt: incorrectPasswordAttempt+1,
              })
              return next(new AppError('Please put correct password',401))
         }
         //get token
        const token = await user.createToken(user._id)

        res.status(200).json({
            status:'success',
            token
        })

    } catch (error) {
        res.status(400).json({
        status: 'Failed to login User',
        message: error
        })
    }
 }

 async function protect(req,res, next){
    // check header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Invalid token in header ',401))
    }
    const token = authHeader.split(' ')[1]
    //if no token
    if(!token){
        return next(new AppError('You are not loggged in!',401))
    }
    try {
        //verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        //check if user still exists after giving token
        const currentUser = await User.findById(payload.id)

        if(!currentUser){
        return next(new AppError(
            'The token belonging to the user does no longer exist ',
             401))
        }
        
        req.user = currentUser
        next()

    } catch (error) {
        return next(new AppError('Failed to login ',401))
    }
 }




module.exports = {
  signUp, 
  login,
  protect,
}