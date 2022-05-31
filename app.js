const express = require('express')
const {protect} = require('./controllers/authController')


const userRouter = require('./routes/user.router')
const movieRouter = require('./routes/movie.router')

const app = express();


app.use(express.json());

app.use('/api/v1/', userRouter)
app.use('/api/v1/',protect, movieRouter)

module.exports = app