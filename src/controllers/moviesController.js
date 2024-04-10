const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { log } = require('console');


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id,{
            include:['genre','actors']
        })
            .then(movie => {
                // return res.send(movie)
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        Genres.findAll({
            order:['name']
        })
        .then(allGenres=>{
            return res.render('moviesAdd',
            {allGenres})
        })
    },
    create: function (req,res) {
        // return res.send(req.body)
        const {title, release_date, awards, rating, length, genre_id} = req.body
        Movies.create({
            title: title.trim(),
            rating,
            awards,
            length,
            release_date,
            genre_id
        })
            .then(movie=>{
                return res.redirect('/movies/detail/' + movie.id)
            })
            .catch(error =>{
                console.log(error)
            })
    },
    edit: function(req,res) {

        const genres = Genres.findAll({
            order:['name']
        })

        const movie = Movies.findByPk(req.params.id,{
            include:['genre']
        })

        Promise.all([genres,movie])
        .then(([genres,movie])=>{
            // console.log(movie);
            // return res.send([genres,Movie])
            return res.render('moviesEdit',{
                Movie: movie, 
                allGenres: genres})
        })
        .catch(error =>{
            console.log(error)
        })

    },
    update: function (req,res) {
         // return res.send(req.body)
        const {title, rating, awards, length,release_date, genre_id} = req.body

        Movies.update(
            {
                title: title.trim(),
                rating,
                awards,
                length,
                release_date,
                genre_id
            },
            {
                where:{
                    id : req.params.id
                }
            }
        )
        .then(response=>{
            console.log(response)
            return res.redirect( '/movies/detail/'+ req.params.id)
        })
        .catch(error =>{
            console.log(error)})


    },
    delete: function (req,res) {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                // return res.send(movie)
                res.render('moviesDelete.ejs',
                 {Movie: movie});
            })
            .catch(error =>{
                console.log(error)});

    },
    destroy: function (req,res) {

        db.Actor_Movie.destroy({
            where:{movie_id: req.params.id}
        })
        .then(()=>{

            db.Actor.update(
            {
                favorite_movie_id:null
            },
            {
                where:{
                    favorite_movie_id: req.params.id
                }
            })
            .then(()=>{
                Movies.destroy({
                    where:{id: req.params.id}
                })
                .then(()=> {
                  return  res.redirect('/movies');
                })
            })
        })
            .catch(error =>{
                console.log(error)});

    }
}

module.exports = moviesController;