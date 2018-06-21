const express = require('express');
const bodyParser = require('body-parser');

const mainRouter = express.Router();


var usrID = require('../config/passport');
var neo4j = require('../config/database');
var neo_session = neo4j.session;


mainRouter.use(bodyParser.json());

//Main and movie search pages
mainRouter.route('/')
.get((req, res, next) => {
  var movieArr2 = [];
  var movieArr = [];
  neo_session
      .run('MATCH (RecommendedMovie:Movie) 	\
      OPTIONAL match (RecommendedMovie)<-[r:WATCHED]-(u:User) \
      WITH RecommendedMovie, count(u) as num_watch \
      ORDER by num_watch DESC  \
      return RecommendedMovie limit 3')
      .then(function(result){

        result.records.forEach(function(record){
          movieArr.push({
            title: record._fields[0].properties.title,
            tagline: record._fields[0].properties.tagline,
            released: record._fields[0].properties.released,
          });
        });     
        console.log(movieArr);
      })
      .catch(function(err){
        console.log(err)
      });
      
      neo_session
      .run('MATCH (p1:User)-[:WATCHED]->(movie1:Movie)<-[:WATCHED]-(p2:User)-[:WATCHED]->(prod2:Movie)\
      WITH p1,p2,count(movie1) AS NrOfSharedMovies, collect(movie1) AS SharedMovies,prod2\
      WHERE NOT(p1-[:WATCHED]->prod2) AND NrOfSharedMovies > 2\
      WITH p1.id AS FirstUserId, p2.id AS SecondUserId, extract(x IN SharedMovies | x.title) AS SharedMovies, prod2.title AS RecommendedMovie\
      WHERE p1.id = "5b271058da088c57f2dcd3a0"\
      RETURN RecommendedMovie')
      .then(function(result){
        
        result.records.forEach(function(record){
          movieArr2.push({
            title: record._fields[0]
           
          });
        });     
        res.render('main', {
          movies: movieArr,
          movies2: movieArr2
        });
        console.log(movieArr2);
      })
      .catch(function(err){
        console.log(err)
      });
})

//Search page
.post((req, res, next) => {
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
//Description Search page
mainRouter.route('/description/')
.post((req, res, next) => {
  var paramName2 = req.body.descriptionMovie
  neo_session
  .run("MATCH (n:Movie{title:{title}}) <- [r] - (p:Person)\
  return n.title, p.name, head(split(lower(type(r)), '_')), r.roles, p.born",{title: paramName2})

  .then((result) => {
    var movieT = result.records[0];
    var singleT = movieT.get(0)
    var movieArr2 = [];
    result.records.forEach((record) => {
      movieArr2.push({
        name: record._fields[1],
        job: record._fields[2],
        role: record._fields[3],
        born: record._fields[4]
      });
    });  
    res.render('description', {
      movieDescription: movieArr2,
      movieTT: singleT
    }); 
  })
  .catch((err) => {
    console.log(err)
  });
});

//Person search page
mainRouter.route('/person/')
.post((req, res, next) => {
  var paramName2 = req.body.searchPerson;
      
  neo_session
    .run("MATCH (p:Person{name:{name}}) -->  (n:Movie)\
    return p.name, n.title, n.tagline, n.released",{name: paramName2})

    .then((result) => {
      var personN = result.records[0];
      var singleN = personN.get(0)
      var movieArr2 = [];
      
      result.records.forEach((record) => {      
        movieArr2.push({         
          title: record._fields[1],
          tagline: record._fields[2],
          released: record._fields[3]    
        });
      });     
      res.render('person', {
        personDescription: movieArr2,
        personNN: singleN
      }); 
    })
    .catch((err) => {
      console.log(err)
    });
});


module.exports = mainRouter;
