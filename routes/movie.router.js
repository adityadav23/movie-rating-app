const express = require('express')
const {updateRating,
    getMovie,
    createMovie,
} = require('../controllers/movie.controller')
const router =express.Router();

router.route('/movie').post(createMovie).get(getMovie);
router.route('/movie/:movieId').patch(updateRating);


module.exports = router