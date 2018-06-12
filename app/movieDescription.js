// ./app/movieDescription.js
var neo4j = require('neo4j-driver').v1;
var morgan = require('morgan');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

//construct Decription Router 
const descriptionRouter = express.Router();
descriptionRouter.use(bodyParser.json()); 
descriptionRouter.route('/')

//view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ exteneded : false}));
app.use(express.static(path.join(__dirname, 'public')));

//connect Neo4j with node.js
var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
var session = driver.session();

descriptionRouter.post('/movies/search/description', (req, res) =>{
    
  var paramName2 = req.body.descriptionMovie;
   
  session

  .run("MATCH (n:Movie{title:{title}}) <- [r]- (p:Person)\
  return n.title, p.name, head(split(lower(type(r)), '_')), r.roles, p.born",{title: paramName2})

  .then(function(result){
    var movieT = result.records[0];
    var singleT = movieT.get(0)
    var movieArr2 = [];
        
    result.records.forEach(function(record){
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
  .catch(function(err){
    console.log(err)
  });
}) 
  
module.exports = descriptionRouter;
