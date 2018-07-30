// ./routes/searchRoute.js
const express = require('express');
const bodyParser = require('body-parser');

const searchRouter = express.Router();

var usrID = require('../config/passport');
var neo4j = require('../config/configuration');
var neo_session = neo4j.databaseConfig.session;

searchRouter.use(bodyParser.json());

//Main and movie search pages
searchRouter.route('/')
.get((req, res, next) => {
  var movieArr2 = [];
  var movieArr = [];
  var valid_id = usrID.userID;

  neo_session
    .run('MATCH (m:Movie) 	\
    OPTIONAL match (m)<-[r:WATCHED]-(u:User) \
    WITH m, count(u) as num_watch \
    ORDER by num_watch DESC  \
    RETURN m')
    .then(function(result){

      result.records.forEach(function(record){
        movieArr.push({
          title: record._fields[0].properties.title,
          tagline: record._fields[0].properties.tagline,
          released: record._fields[0].properties.released,
        });
      });
      //If user is not signed in, display movie list only
      if (!req.user) {     
        res.render('main', {
          movies: movieArr,
          movies2: movieArr2,
          valid: req.user
        });
      }
    })
    .catch(function(err){
      console.log(err)
    });
  
  //If user is signed in, display both movie list and recommandation list.
  if (req.user){ 
    neo_session
      .run('MATCH (p1:User)-[:WATCHED]->(movie1:Movie)<-[:WATCHED]-(p2:User)-[:WATCHED]->(prod2:Movie)\
      WITH p1,p2,count(movie1) AS NrOfSharedMovies, collect(movie1) AS SharedMovies,prod2\
      WHERE NOT(p1-[:WATCHED]->prod2) AND NrOfSharedMovies > 2\
      WITH p1.id AS FirstUserId, p2.id AS SecondUserId, extract(x IN SharedMovies | x.title) AS SharedMovies, prod2 AS RecommendedMovie\
      WHERE p1.id = {id} AND NOT (p1)-[:PREFERRED {like:-1}]->(RecommendedMovie)\
      RETURN DISTINCT RecommendedMovie AS Recom\
      UNION\
      MATCH (p3:User)-[:PREFERRED {like:1}]->(movie2:Movie)<-[:WATCHED]-(p4:User)-[:WATCHED]->(prod3:Movie)\
      WITH p3,p4,count(movie2) AS NrOfSharedMovies1, collect(movie2) AS SharedMovies1,prod3\
      WHERE NOT(p3-[:WATCHED]->prod3)\
      WITH p3.id AS ThirdUserId, p4.id AS FourthUserId, extract(x1 IN SharedMovies1 | x1.title) AS SharedMovies1, prod3 AS RecommendedMovie1\
      WHERE p3.id = {id} AND NOT (p3)-[:PREFERRED {like:-1}]->(RecommendedMovie1)\
      RETURN RecommendedMovie1 AS Recom', {id: valid_id})

      .then(function(result){
        
        result.records.forEach(function(record){
          movieArr2.push({
            title: record._fields[0].properties.title,
            tagline: record._fields[0].properties.tagline,
            released: record._fields[0].properties.released
          });
        });

        //if movieArr2 is empty, copy first 10 movieArr data & order by the released year
        if (movieArr2.length == 0) {
          movieArr2=movieArr.slice(0,10);
          movieArr2.sort(function (obj1, obj2) {
            return obj2.released - obj1.released;
          });
        } 
        res.render('main', {
          movies: movieArr,
          movies2: movieArr2,
          valid: req.user
        });
      })
      .catch(function(err){
        console.log(err)
      });
  }
  
})

//Search page
.post((req, res, next) => {
  var paramName = req.body.searchMovie;
  
  neo_session  
    .run("MATCH (n:Movie) WHERE n.title =~ {title} RETURN n ", 
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
        moviesearch: movieArr,
        valid: req.user
      }); 
    })
    .catch(function(err){
      console.log(err)
    })
});

//Description Search page
searchRouter.route('/description/')
.post((req, res, next) => {
  var paramName2 = req.body.descriptionMovie
  neo_session
  .run("MATCH (n:Movie{title:{title}}) <- [r] - (p:Person)\
  RETURN n.title, p.name, head(split(lower(type(r)), '_')), r.roles, p.born",{title: paramName2})

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
      movieTT: singleT,
      valid: req.user
    }); 
  })
  .catch((err) => {
    console.log(err)
  });
});

//Person search page
searchRouter.route('/person/')
.post((req, res, next) => {
  var paramName2 = req.body.searchPerson;
  
  neo_session
    .run("MATCH (p:Person{name:{name}}) -->  (n:Movie)\
    RETURN DISTINCT p.name, n.title, n.tagline, n.released",{name: paramName2})

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
        personNN: singleN,
        valid: req.user
      }); 
    })
    .catch((err) => {
      console.log(err)
    });
}); 

module.exports = searchRouter;