# Neo4jVisualization

## Quick Start
### 1. Setup

```
$ npm install
```

### 2. Run locally

* Start Neo4j ([Download & Install](http://neo4j.com/download)) locally and open the [Neo4j Browser](http://localhost:7474).
* Default ID is 'neo4j' and you need to set password as '12345'.
* Install the Movies dataset with `:play movies`, click the statement, and hit the triangular "Run" button.
* Clone this project from GitHub.
* Install MongoDB using following terminal command:

```
$ brew install mongodb
```
* Run 'mongod' on the other terminal to run MongoDB server.

```
$ mongod
```
* Go to the project path and run 'nodemon' on the terminal.

```
$ nodemon
```

### 3. MongoDB

[***3.1 Install MongoDB Community Edition***](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-linux/)

***3.2run MongoDB server***

```
mongod --dbpath /home/gmcui/Apps/mongodb/data/db --port 37017 --bind_ip 0.0.0.0
```

***3.3 Begin using MongoDB***

```
mongo --host 192.168.1.211:37017
```
