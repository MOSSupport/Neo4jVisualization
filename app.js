const express = require('express')
	, path = require('path')
	, morgan = require('morgan')
	, bodyParser = require('body-parser')
	, http = require('http')
	, neo4j = require('neo4j-driver').v1;
	
const app = express();
const router = express.Router();
const movieRouter = require('./routes/movieRouter');
const hostname = 'localhost';
const port = 3000;

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));

var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
var session = driver.session();

/* app.use((req, res, next) => {
	res.status = 200;
	res.setHeader('Content-Type', 'text/html');
	res.end('<html><body><h1>This an Express Server</h1></body><html>');
}); */

router.route('/movies/:name').get(function(req, res){
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

router.route('/movies').get(function(req, res){
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

router.route('/movies/search').post(function(req,res){
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

const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
app.use('/', router);
module.exports = app;