// ./app/movieDescription.js
var neo4j = require('neo4j-driver').v1;
var morgan = require('morgan');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var router = express.Router();
var _ = require('lodash');

var app = express();

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
    
    .run("MATCH (m:Movie) WHERE m.title = {title}\
    OPTIONAL MATCH (x:Person)- [:ACTED_IN] -> (m) return x,m",
   {title: paramName2})
   
    .then(result => {  
     var movieArr2 = [];
     var movieT = result.records[1];
     var singleT = movieT.get(1);

     result.records.forEach(function(record){

        movieArr2.push({
            id:record._fields[0].identity.low,        
            name: record._fields[0].properties.name,
            born: record._fields[0].properties.born,
        });
    });     
        res.render('description', {
          movieDescription: movieArr2,
          movieTT: singleT.properties
        });   
        console.log (singleT);
    })
  .catch(function(err){
      console.log(err)
      });
  }) 
  
module.exports = descriptionRouter;
