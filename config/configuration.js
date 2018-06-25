// ./config/database.js
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver('bolt://192.168.1.211:17687', neo4j.auth.basic('neo4j', 'admin'));

module.exports.googleLoginConfig = {
  //Google social login authentication
  'googleAuth' : {
    'clientID'      : '521413328647-napr980n56pgvbjescd05dsc65431cvt.apps.googleusercontent.com',
    'clientSecret'  : 'msjdRdsp4-62M_bOj3HetVGL',
    'callbackURL'   : 'http://localhost:3000/auth/google/callback'
  }
};

module.exports.databaseConfig = {
  //mongoDB database url
  'url' : 'mongodb://192.168.1.211:37017/UserInfo',
  'session' : driver.session()
};