const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    movie: {
        type: mongoose.Schema.ObjectId,
        ref: 'Movie',
    },
    rating:{
        type:Number,
    }
})

module.exports = mongoose.model('Rating', ratingSchema);