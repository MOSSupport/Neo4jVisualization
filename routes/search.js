const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver').v1;
const searchRouter = express.Router();

searchRouter.use(bodyParser.json()); 

searchRouter.route('/')

//Neo4j Driver and session variable
var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
var session = driver.session();

searchRouter.post('/movies/search', (req, res) => {
	var name = req.body.title;

	session
		.run('MATCH (n:Movie) WHERE n.title =~ {title} RETURN n LIMIT 40', {title: '(?i).*' + name + '.*'})
		.then(function(result){
			var movieArry = [];
			result.records.forEach(function(record){
				movieArry.push({
					id: record._fields[0].identity.low,
					title: record._fields[0].properties.title,
					year: record._fields[0].properties.year
				});
			});
			res.render('index', {
				movies: movieArry
			});
		})
		.catch(function(err){							//Outputs error message if the query did not go through		
			console.log(err);
		});

	console.log(name);
});

searchRouter.get('/movies', (req, res) => {
	session
		.run('MATCH (n:Movie) RETURN n LIMIT 40')		//Cypher query
		.then(function(result){
			var movieArry = [];
			result.records.forEach(function(record){
				movieArry.push({
					id: record._fields[0].identity.low,
					title: record._fields[0].properties.title,
					year: record._fields[0].properties.year
				});
			});
			res.render('index', {
				movies: movieArry
			});
		})												
		.catch(function(err){							//Outputs error message if the query did not go through		
			console.log(err);
		});
});

searchRouter.get('/movies/:name', (req, res) => {
	var movieT = req.params.name;
	
	session
		.run('MATCH (n:Movie) WHERE n.title =~ {title} RETURN n LIMIT 40', {title: '(?i).*' + movieT + '.*'})		//Cypher query
		.then(function(result){
			var movieArry = [];
			result.records.forEach(function(record){
				movieArry.push({
					id: record._fields[0].identity.low,
					title: record._fields[0].properties.title,
					year: record._fields[0].properties.year
				});
			});
			res.render('index', {
				movies: movieArry
			});
		})												
		.catch(function(err){							//Outputs error message if the query did not go through		
			console.log(err);
		});
});

module.exports = searchRouter;