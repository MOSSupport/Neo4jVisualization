const express = require('express');
const bodyParser = require('body-parser');
const sqlRouter = express.Router();
const mysql = require('mysql')

sqlRouter.use(bodyParser.json()); 

sqlRouter.route('/')


var sqlconnect = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'newpassword',
	database : 'userlist'
});

sqlconnect.connect(function(err) {
	if(err) {
		console.log('Error connecting sql server.');
		console.log(err);
	} else {
		console.log('Successfully connected to the sql server');
	}
});


module.exports = sqlRouter;