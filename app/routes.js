// ./app/routes.js
module.exports = (serverApp, passport) => {

  var neo4j = require('../config/database');
  var neo_session = neo4j.session;

  // Home Page
  serverApp.get('/sociallogin', login, (req, res) => {
    res.render('index.ejs'); // load the index.ejs file
  });

  // Login Page
  // show the login form
  serverApp.get('/login', (req, res) => {
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
  serverApp.get('/signup', (req, res) => {
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

      .then((result) => {
        console.log("Successfully created a relationship between the user and the movie.");
      })
      .catch((err) => {
        console.log(err)
      });
  });

  //Show Visualization graph of relationship between User and Movie nodes
  serverApp.get('/visualization', isLoggedIn, (req, res) => {
    res.render('graphVis.ejs', {});
  });

  //Show user profile page with login information
  serverApp.get('/profile',  isLoggedIn, (req, res) => {
    if (usrID.NuserID) {
      //Create User node in Neo4j Database
      const insertingUser = neo_session.run(
        "MERGE (u:User {id : {id}})",{id: usrID.NuserID}
      );
      insertingUser.then(() => {
        console.log("Successfully created the User node (No duplicated node will be created).");
        neo_session.close();
      })
      .catch((err) => {
        console.log(err)
        neo_session.close();
      });
    }

    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // Logout page 
  serverApp.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // Google Social Login
  serverApp.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

  // Google Social Login callback
  serverApp.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect : '/profile',
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