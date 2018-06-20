// ./config/database.js
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver('bolt://192.168.1.211:17687', neo4j.auth.basic('neo4j', 'admin'));

module.exports = {
  //mongoDB database url
  'url' : 'mongodb://192.168.1.211:37017/UserInfo',
  'session' : driver.session()
};