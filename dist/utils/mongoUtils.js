'use strict';

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    Server = mongodb.Server,
    fs = require('fs'),
    exec = require("child_process").exec;
var logger = require('logger').createLogger('remoteService.log');

var _db = void 0,
    _dbName = void 0,
    _mongoClient = void 0,
    _mongoPort = void 0,
    _hostName = void 0,
    _adminUser = void 0,
    _adminUserPwd = void 0,
    _remoteMongoInstance = void 0;

module.exports = {

    connectToDB: function connectToDB(dbName, callback) {
        try {
            _dbName = dbName;
            _remoteMongoInstance = process.env.REMOTE_MONGO_INSTANCE;
            _hostName = process.env.REMOTE_HOST_NAME;
            _mongoPort = process.env.REMOTE_MONGO_PORT;
            _adminUser = process.env.USERS_ADMIN_USER;
            _adminUserPwd = process.env.USERS_ADMIN_PWD;

            var remoteMongoInstance = process.env.REMOTE_MONGO_INSTANCE;
            var mongoUrl = _remoteMongoInstance + '://' + _adminUser + ':' + _adminUserPwd + '@' + _hostName + ':' + _mongoPort + '/' + _dbName;
            logger.info('::[mongoUtils]=> connectToDB() => connecting to db with URL: ' + mongoUrl);
            var options = {};
            var server = new Server(_hostName, _mongoPort, options);
            mongoConnect(server, mongoUrl, callback);
        } catch (err) {
            logger.info(err);
        }
    },

    getClient: function getClient() {
        return _mongoClient;
    },

    getDB: function getDB() {
        return _db;
    },

    getMongoPort: function getMongoPort() {
        return _mongoPort;
    },

    getHostName: function getHostName() {
        return _hostName;
    }

};

var mongoConnect = function mongoConnect(server, mongoUrl, callback) {
    try {
        _mongoClient = MongoClient;
        _mongoClient.connect(mongoUrl, { useNewUrlParser: true }, function (err, client) {
            if (client) {
                logger.info('::[mongoUtils]=> mongoConnect() => built client with URL: ' + mongoUrl);
                _db = client.db(_dbName);
                logger.info('::[mongoUtils]=> mongoConnect() => db: ' + _dbName);
                _mongoClient = client;
                // logger.info(_db);
                logger.info('::[mongoUtils]=> mongoConnect() => Connected to db with URL: ' + mongoUrl);
                return callback(client);
            }
            if (err) logger.info(err);
            return callback(err);
        });
    } catch (err) {
        logger.error('::[mongoUtils]=> mongoConnect() => ' + err);
    }
};