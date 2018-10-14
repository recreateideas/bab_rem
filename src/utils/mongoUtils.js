const mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    Server = mongodb.Server,
    fs = require('fs'),
    exec = require("child_process").exec;

let _db, _dbName, _mongoClient, _mongoPort, _hostName, _adminUser, _adminUserPwd, _remoteMongoInstance;

module.exports = {

    connectToDB: (dbName,callback) => {
        try{
            console.log('loggin in....');
            _dbName = dbName;
            _remoteMongoInstance = process.env.REMOTE_MONGO_INSTANCE;
            _hostName = process.env.REMOTE_HOST_NAME;
            _mongoPort = process.env.REMOTE_MONGO_PORT;
            _adminUser = process.env.USERS_ADMIN_USER;
            _adminUserPwd = process.env.USERS_ADMIN_PWD;
            
            const remoteMongoInstance = process.env.REMOTE_MONGO_INSTANCE;
            const mongoUrl = `${_remoteMongoInstance}://${_adminUser}:${_adminUserPwd}@${_hostName}:${_mongoPort}/${_dbName}`;
            const options={};
            const server = new Server(_hostName, _mongoPort, options)
            mongoConnect(server,mongoUrl,callback);

        } catch(err){
            console.log(err);
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

        _mongoClient.connect(mongoUrl, (err, client) => {
            if (client) {
                _db = client.db(_dbName);
                _mongoClient = client;
                // console.log(_db);
                console.log(`Connected to db...${mongoUrl}`);
                return callback(client);
            }
            if (err) console.log(err);
            return callback(err);
        });
    }
    catch (err) {
        console.log(err);
    }
};
