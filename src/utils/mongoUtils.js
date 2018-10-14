const mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    Server = mongodb.Server,
    fs = require('fs'),
    exec = require("child_process").exec;
var logger = require('logger').createLogger('remoteService.log');

let _db, _dbName, _mongoClient, _mongoPort, _hostName, _adminUser, _adminUserPwd, _remoteMongoInstance;

module.exports = {

    connectToDB: (dbName,callback) => {
        try{
            _dbName = dbName;
            _remoteMongoInstance = process.env.REMOTE_MONGO_INSTANCE;
            _hostName = process.env.REMOTE_HOST_NAME;
            _mongoPort = process.env.REMOTE_MONGO_PORT;
            _adminUser = process.env.USERS_ADMIN_USER;
            _adminUserPwd = process.env.USERS_ADMIN_PWD;
            
            const remoteMongoInstance = process.env.REMOTE_MONGO_INSTANCE;
            const mongoUrl = `${_remoteMongoInstance}://${_adminUser}:${_adminUserPwd}@${_hostName}:${_mongoPort}/${_dbName}`;
            logger.info(`::[mongoUtils]=> connectToDB() => connecting to db with URL: ${mongoUrl}`);
            const options={};
            const server = new Server(_hostName, _mongoPort, options)
            mongoConnect(server,mongoUrl,callback);

        } catch(err){
            logger.info(err);
        }
    },

    getClient: () => {
        return _mongoClient;
    },

    getDB: () => {
        return _db;
    },

    getMongoPort: () => {
        return _mongoPort;
    },

    getHostName: () => {
        return _hostName;
    },

};

const mongoConnect = (server,mongoUrl,callback) => {
    try {
        _mongoClient = MongoClient;
        _mongoClient.connect(mongoUrl,{ useNewUrlParser: true }, (err, client) => {
            if (client) {
                logger.info(`::[mongoUtils]=> mongoConnect() => built client with URL: ${mongoUrl}`);
                _db = client.db(_dbName);
                logger.info(`::[mongoUtils]=> mongoConnect() => db: ${_dbName}`);
                _mongoClient = client;
                // logger.info(_db);
                logger.info(`::[mongoUtils]=> mongoConnect() => Connected to db with URL: ${mongoUrl}`);
                return callback(client);
            }
            if (err) logger.info(err);
            return callback(err);
        });
    }
    catch (err) {
        logger.error(`::[mongoUtils]=> mongoConnect() => ${err}`);
    }
};
