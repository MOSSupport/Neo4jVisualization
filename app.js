//Required modules for running node.js server
const express = require('express')
	, path = require('path')
	, morgan = require('morgan')
	, bodyParser = require('body-parser')
	, http = require('http');
	
const app = express();
const router = express.Router();
const hostname = 'localhost';
const port = 3000;
const searchRouter = require('./routes/search');
const sqlRouter = require('./routes/sqlconnect');

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));

//Search Router
app.use(searchRouter);

//SQL Router
app.use(sqlRouter);

const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
app.use('/', router);
module.exports = app;