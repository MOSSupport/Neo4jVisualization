const express = require('express');
const bodyParser = require('body-parser');

const mainRouter = express.Router();

var neo4j = require('../config/database');
var neo_session = neo4j.session;

mainRouter.use(bodyParser.json());

//Main and movie search pages
mainRouter.route('/')
.get((req, res, next) => {
  neo_session
    .run('MATCH (m:Movie) \
    OPTIONAL match (m)<-[r:WATCHED]-(u:User) \
    WITH m, count(u) as num_watch \
    return m, num_watch \
    ORDER by num_watch DESC')
    .then((result) => {
      var movieArr = [];
        
      result.records.forEach((record) => {
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
    .catch((err) => {
      console.log(err)
    });
})
.post((req, res, next) => {
  var paramName = req.body.searchMovie;
    
  neo_session  
    .run("MATCH (n:Movie) WHERE n.title =~ {title} return n ", 
    {title: '(?i).*' + paramName + '.*'})
        
    .then((result) => {
      var movieArr = [];
      result.records.forEach((record) => {
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
    .catch((err) => {
      console.log(err)
    })
});

//Description Search page
mainRouter.route('/description/')
.post((req, res, next) => {
  var paramName2 = req.body.descriptionMovie;
  
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