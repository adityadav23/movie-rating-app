const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({

    title:{
        type: String,
        required: [true, 'Title cannot be empty'],
        unique:true,
    },
    year:{
        type:'Number',
        required:[true, "Please provie movie release year!"]
    },
    rating:{
        type: Number,
        default:0,
    },
    
})

module.exports = mongoose.model('Movie', movieSchema)