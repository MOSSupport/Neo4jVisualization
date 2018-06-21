// ./server.js
//Required modules
const express = require('express');
const serverApp = express();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const uuid = require('uuid-v4');
const DBconfig = require('./config/database.js');
const port = 3000;
const hostname = '0.0.0.0';
const mainRoute = require('./app/mainRoute.js')

//DB configuration
mongoose.connect(DBconfig.url); //connect to the mongoDB
require('./config/passport.js')(passport);  //passport configuration

//Express application setup
serverApp.use(morgan('dev'));
serverApp.use(cookieParser());
//serverApp.use(bodyParser());
serverApp.use(bodyParser.urlencoded({extended : false}));

//Set view engine to ejs
serverApp.set('view engine','ejs');

//Required elements for passport module
serverApp.use(session({
  genid: function(req) {return uuid();},
  secret: 'ilovescotchscotchy',
  resave: true,
  saveUninitialized: true
}));

serverApp.use(passport.initialize());
serverApp.use(passport.session());
serverApp.use(flash());
serverApp.use(mainRoute);

//Routes
require('./app/routes.js')(serverApp, passport);


const server = http.createServer(serverApp);
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
//serverApp.use('/', router);
module.exports = serverApp;
