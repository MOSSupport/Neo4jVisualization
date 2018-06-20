const express = require('express');
const bodyParser = require('body-parser');

const mainRouter = express.Router();

const check_login = require('../app/routes')

var neo4j = require('../config/database');
var neo_session = neo4j.session;


mainRouter.use(bodyParser.json());

mainRouter.route('/')
//main page
.get((req, res, next) => {
  neo_session
      .run('MATCH (m:Movie) \
      OPTIONAL match (m)<-[r:WATCHED]-(u:User) \
      WITH m, count(u) as num_watch \
      return m, num_watch \
      ORDER by num_watch DESC')
      .then(function(result){
        var movieArr = [];
          
        result.records.forEach(function(record){
          movieArr.push({
            id: record._fields[0].identity.low,
            title: record._fields[0].properties.title,
            tagline: record._fields[0].properties.tagline,
            released: record._fields[0].properties.released
          });
        });     
        res.render('main', {
          movies: movieArr
        });
      })
      .catch(function(err){
        console.log(err)
      });
})
//Search page
.post(check_login.isLoggedIn, (req, res, next) => {
  var paramName = req.body.searchMovie;
    
  neo_session  
    .run("MATCH (n:Movie) WHERE n.title =~ {title} return n ", 
    {title: '(?i).*' + paramName + '.*'})
        
    .then(function(result){
      var movieArr = [];
      result.records.forEach(function(record){
        movieArr.push({
        id:record._fields[0].identity.low,        
        released: record._fields[0].properties.released,
        tagline: record._fields[0].properties.tagline,
        title: record._fields[0].properties.title
        });
      });     
      res.render('search', {
        moviesearch: movieArr
      }); 
    })
    .catch(function(err){
      console.log(err)
    })
});

mainRouter.route('/')
//
.get((req, res, next) => {
  neo_session
      .run('MATCH (m:Movie) \
      OPTIONAL match (m)<-[r:WATCHED]-(u:User) \
      WITH m, count(u) as num_watch \
      return m, num_watch \
      ORDER by num_watch DESC')
      .then(function(result){
        var movieArr = [];
          
        result.records.forEach(function(record){
          movieArr.push({
            id: record._fields[0].identity.low,
            title: record._fields[0].properties.title,
            tagline: record._fields[0].properties.tagline,
            released: record._fields[0].properties.released
          });
        });     
        res.render('main', {
          movies: movieArr
        });
      })
      .catch(function(err){
        console.log(err)
      });
})
//
.post(check_login.isLoggedIn, (req, res, next) => {
  var paramName = req.body.searchMovie;
    
  neo_session  
    .run("MATCH (n:Movie) WHERE n.title =~ {title} return n ", 
    {title: '(?i).*' + paramName + '.*'})
        
    .then(function(result){
      var movieArr = [];
      result.records.forEach(function(record){
        movieArr.push({
        id:record._fields[0].identity.low,        
        released: record._fields[0].properties.released,
        tagline: record._fields[0].properties.tagline,
        title: record._fields[0].properties.title
        });
      });     
      res.render('search', {
        moviesearch: movieArr
      }); 
    })
    .catch(function(err){
      console.log(err)
    })
});


module.exports = mainRouter;