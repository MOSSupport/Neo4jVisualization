// ./app/routes.js
module.exports = function(serverApp, passport) {
  //Neo4j Configuration
  var neo4j = require('neo4j-driver').v1;
  var driver = neo4j.driver('bolt://192.168.1.211:17687', neo4j.auth.basic('neo4j', 'admin'));
  var neo_session = driver.session();
  var usrID = require('../config/passport');

  // Home Page
  serverApp.get('/sociallogin', login, function(req, res) {
    res.render('index.ejs'); // load the index.ejs file
  });

  // Login Page
  // show the login form
  serverApp.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') }); 
  });

  // process the login form
  serverApp.post('/login', passport.authenticate('local-login', {
    successRedirect : '/',    //if succeed, redirect to home page
    failureRedirect : '/login',    //if not, redirect to signup page
    failureFlash : true
  }));

  // Signup Page
  // show the signup form
  serverApp.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  serverApp.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',    //if succeed, redirect to profile page
    failureRedirect : '/signup',    //if not, redirect to signup page
    failureFlash : true
  }));

  //Add :WATCHED relationship to Neo4j
  serverApp.post('/movies/clickWatch', isLoggedIn, (req, res) => {
    var title = req.body.inputClickWatch;
    //console.log(usrID.userID);

    neo_session
      .run("MATCH (u1:User), (m1:Movie)\
      WHERE u1.id = {id} and m1.title = {title}\
      MERGE (u1)-[r:WATCHED]->(m1)\
      ON CREATE SET r.count = 1\
      ON MATCH SET r.count = r.count + 1\
      RETURN u1,r,m1", {id: usrID.userID , title : title})

      .then(function(result){
        console.log("Successfully created a relationship between the user and the movie.");
      })
      .catch(function(err){
        console.log(err)
      });
  });

  //Person search page
  serverApp.post('/movies/search/description/person', isLoggedIn, (req, res) =>{  
    var paramName2 = req.body.searchPerson;
      
    neo_session
      .run("MATCH (p:Person{name:{name}}) -->  (n:Movie)\
      return p.name, n.title, n.tagline, n.released",{name: paramName2})
  
      .then(function(result){
        var personN = result.records[0];
        var singleN = personN.get(0)
        var movieArr2 = [];
        
        result.records.forEach(function(record){      
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
      .catch(function(err){
        console.log(err)
      });
  }) 

  //Description search page
  serverApp.post('/movies/search/description', isLoggedIn, (req, res) =>{
    var paramName2 = req.body.descriptionMovie;
    
    neo_session
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
  });
  
  //Search page
  serverApp.post('/movies/search', isLoggedIn, (req, res) =>{
    var paramName = req.body.searchMovie;
    
    neo_session  
      .run("MATCH (n:Movie) WHERE n.title =~ {title} return n ", 
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
          moviesearch: movieArr
        }); 
      })
      .catch(function(err){
        console.log(err)
      });
  });

  // Main page to show after login
  serverApp.get('/', function(req, res) {
    
    neo_session
      .run('MATCH (m:Movie) \
      OPTIONAL match (m)<-[r:WATCHED]-(u:User) \
      WITH m, count(u) as num_watch \
      return m, num_watch \
      ORDER by num_watch DESC')
      .then(function(result){
        var movieArr = [];
          
        result.records.forEach(function(record){
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
      .catch(function(err){
        console.log(err)
      });
  });

  //Show Visualization graph of relationship between User and Movie nodes
  serverApp.get('/visualization', isLoggedIn, function(req, res) {
    res.render('graphVis.ejs', {});
  });

  //Show user profile page with login information
  serverApp.get('/profile', isLoggedIn, function(req, res) {

    if (usrID.NuserID) {
      //Create User node in Neo4j Database
      const insertingUser = neo_session.run(
        "MERGE (u:User {id : {id}})",{id: usrID.NuserID}
      );
      insertingUser.then(function() {
        console.log("Successfully created the User node (No duplicated node will be created).");
        neo_session.close();
      })
      .catch(function(err){
        console.log(err)
        neo_session.close();
      });
    }

    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // Logout page 
  serverApp.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // Google Social Login
  serverApp.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

  // Google Social Login callback
  serverApp.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/sociallogin'
  }));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/sociallogin');
}

function login(req, res, next) {
  if (!req.isAuthenticated())
    return next();
  res.redirect('/profile');
}


function red(){

}