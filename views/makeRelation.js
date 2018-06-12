// ./app/makeRelation.js

//connect Neo4j with node.js
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver('bolt://127.0.0.1:7687', neo4j.auth.basic('neo4j', '12345'));
var session = driver.session();
var usrID = require('../config/passport');


function relation(movie) {
	//movie = "The Matrix";
	console.log(usrID.userID + ' ' + movie);
	const insertingUser = session.run(
		"MATCH (u:User {id: {id}}), (m:Movie {title: {title}}) MERGE (u)-[:WATCHED]->(m)", {id: usrID.userID, title: movie}
	);
	insertingUser.then(function() {
		console.log("Successfully created a relationship between the user and the movie.");
		session.close();
	})
	.catch(function(err){
		console.log(err)
		session.close();
	});
};

module.exports = relation;