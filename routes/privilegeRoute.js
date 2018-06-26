// ./routes/privilegeRoute.js
const express = require('express');
const bodyParser = require('body-parser');

const privilegeRouter = express.Router();

var check_login = require('./loginRoute');
var usrID = require('../config/passport');
var neo4j = require('../config/configuration');
var neo_session = neo4j.databaseConfig.session;


privilegeRouter.use(bodyParser.json());

//Show user profile page with login information and watch function
privilegeRouter.route('/user')
.get(check_login.isLoggedIn, (req, res, next) => {
  if (usrID.NuserID) {
    //Create User node in Neo4j Database
    neo_session
      .run(
        "MERGE (u:User {id : {id}})",{id: usrID.NuserID}
      )
      .then(() => {
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
})
.post(check_login.isLoggedIn, (req, res, next) => {
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
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
});

privilegeRouter.route('/prefer')
.post(check_login.isLoggedIn, (req, res, next) => {
  var len = req.body.like.length;
  var like = req.body.like.slice(0,2);
  var title = req.body.like.slice(2,len);
  
  neo_session
    .run("MATCH (u1:User), (m1:Movie)\
    WHERE u1.id = {id} and m1.title = {title}\
    MERGE (u1)-[r:PREFERRED]->(m1)\
    ON CREATE SET r.like = {like}\
    ON MATCH SET r.like = {like}\
    RETURN u1,r,m1", {id: usrID.userID, title: title, like: like})
    .then((result) => {
      console.log("User pressed like/dislike button and recorded in Neo4j db");
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
    })
})

module.exports = privilegeRouter;