const Movie = require('../models/movies.model')
const Rating = require('../models/rating.model')
const User = require('../models/users.model')

async function updateRating(req, res){
    try{ 
        //get user id from jwt token
        const {_id} = req.user
        const {movieId}  = req.params ;
        const {rating} = req.body;
        //find the rating info 
        const movie = await Movie.findOne({_id:movieId});

        if(!movie){
            return res.status(200).json({
                status: "failed",
                msg: " Movie not found !"
            })
        }
        const oldRating = movie.rating;
        let newRating = 0;
        const allRatingDocs = await Rating.find({movie:movieId})
        const totalUsersRated = allRatingDocs.length ;
        if(totalUsersRated == 0){
            newRating = (Number(rating))/(totalUsersRated+1);
        }else{
            newRating = (oldRating*totalUsersRated + rating)/(totalUsersRated+1);
        }
        //create a rating document record for rating done by user
        const ratingDoc = await Rating.create({
            rating:Number(rating),
            user:_id,
            movie:movieId,
        })
        const updatedMovie = await Movie.findOneAndUpdate(
            {
            _id: movieId
            },
            {
            rating:newRating,
            },
            {
            new: true,
        })

        res
            .status(200)
            .json({
                status: "Success",
                data:{
                    updatedMovie
                }
            })   
     } catch (error) {
        res.status(400).json({
            status:"failed",
            msg: error
        })
     }   
}


async function getMovie(req,res){
    try {
        const {title} = req.body;
        const movie = await Movie.find({title:{$regex: title}},{
            __v:0,
        })
        //if no relevant movie found
        if(!movie){
            res.status(200).json({
                status: "failed",
                msg: "No movie found relevant to search specified!"
            })
        }
        res.status(200).json({
            status: "success",
            movie,
        })

    } catch (error) {
        res.status(400).json({
            status:"failed",
            msg: error
        })
    }   

}

async function createMovie(req,res){
    try {
        const {type} = req.user
        //check if admin
        if(type != "admin"){
            return res
            .status(401)
            .json({
                msg:'User not authorized to add movies!'
            })
        }

        const {title, year,} = req.body;
        
        const movie = await Movie.create({
            title,
            year,
        })
    
         return res.status(201).json({
            status:"success",
            data:{
                movie
            }
        })
    } catch (error) {
        return res.status(400).json({
            status:"failed",
            msg: error
        })
    }

}

module.exports = {
    updateRating,
    getMovie,
    createMovie,
}