'use strict';

var parser = require('mongodb-query-parser');

var _require = require('./mongoUtils'),
    getDB = _require.getDB;

var ObjectID = require('mongodb').ObjectID;

module.exports = {

    loginUser: function loginUser(req, res) {
        try {
            console.log('loggin in user...');
            /************** emptyDB(db); ************/
            getDB().collection('users').find(req.body.details).toArray(function (err, result) {
                if (err) responseData = { userInserted: false, Error: 'ERRL:10. This error occurred during login: ' + err };else if (result && result.length > 0) {
                    var response = removePasswordFromResponse(result);
                    // update lastLoggedInDateTime
                    getDB().collection('users').updateOne(req.body.details, { $set: { lastLoggedInDateTime: new Date() } });
                    responseData = { userFound: true, userDetails: response
                        // add user to online users
                    };
                } else if (result && result.length === 0) {
                    responseData = { userFound: false, Error: 'User not found' };
                } else {
                    responseData = { Error: 'ERRL:16. Not an acceptable login result' };
                }
                res.json(responseData);
            });
        } catch (err) {
            res.json({
                Error: 'ERRL:22. This error occurred during login: ' + err
            });
        }
        // res.json({findAll:true})
    },

    registerUser: function registerUser(req, res) {
        try {
            console.log('registering user...');
            // console.log(req.body.details);
            getDB().collection('users').find(req.body.details).toArray(function (err, result) {
                // console.log(result);
                var userDetails = Object.assign({}, req.body.details, {
                    _id: new ObjectID(),
                    permissionGroup: 'user',
                    dateCreated: new Date(),
                    lastLoggedInDateTime: new Date()
                });

                if (result && result.length === 0) {
                    getDB().collection('users').insertOne(userDetails, function (err, result) {
                        var response = result.toJSON();
                        delete userDetails.password;
                        if (err) responseData = { userInserted: false };else if (response.ok === 1) {
                            responseData = Object.assign(userDetails, { userInserted: true });
                        } else if (response.ok !== 1) responseData = { userInserted: false
                            // add user to online users
                        };res.json(responseData);
                    });
                    getDB().listCollections().toArray(function (err, collections) {
                        console.log(collections);
                    });
                } else {
                    res.json({ Error: 'This user seems to be already registered.' });
                }
            });
        } catch (err) {
            res.json({
                Error: err + '. This occurred during query execution. Check the query parameters'
            });
        }
    },

    updateUser: async function updateUser(req, res) {
        try {
            var details = parser(JSON.stringify(req.body.data));
            console.log('Updating User data...');
            console.log(req.body.user);
            // db.collection('users').find(req.body.user.email).toArray((err, result) => {console.log(result);});
            var action = await getDB().collection('users').updateOne({ email: req.body.user.email }, { $set: details });
            if (action.result.ok === 1 && action.result.nModified > 0) {
                res.json({ userUpdates: true });
            } else {
                console.log('The user didn\'t get updated: ' + JSON.stringify(action.result));
                res.json({
                    Error: 'The user didn\'t get updated: ' + JSON.stringify(action.result)
                });
            }
        } catch (err) {
            console.log(err + '. This occurred during user details update');
            res.json({
                Error: err + '. This occurred during user details update'
            });
        }
        // console.log(req.body.user);
    },

    findUsers: async function findUsers(req, res) {
        var type = req.params.type;
        switch (type) {
            case 'all':
                getDB().collection('users').find({}).toArray(function (err, result) {
                    if (err) res.json({ Error: err + '. This occurred while getting the list of all users' });else res.json({ users: formatResults(result) });
                });
                break;
            default:
                res.json({ Error: 'The user query is not of a correct type' });
                break;

        }
    },

    getAllActiveUsers: async function getAllActiveUsers() {
        try {
            var allActiveUsers = await getDB().collection('activeUsers').find().toArray();
            // console.log(allActiveUsers);
            return allActiveUsers;
        } catch (err) {
            console.log(err + '. This occurred in getAllActiveUsers');
        }
    },

    searchActiveUsersByCustomId: async function searchActiveUsersByCustomId(newClient) {
        try {
            var activeUser = await getDB().collection('activeUsers').findOne({ customId: newClient.customId });
            // console.log('activeUsersList: ',activeUsersList);
            return activeUser;
        } catch (err) {
            console.log(err + '. This occurred in searchActiveUsersByCustomId');
        }
    },

    setUserActiveStatus: async function setUserActiveStatus(newClient, status) {
        var result = void 0;
        try {
            switch (status) {
                case 'active':
                    await getDB().collection('activeUsers').deleteMany({ customId: newClient.customId });
                    result = await getDB().collection('activeUsers').insertOne({
                        customId: newClient.customId,
                        socketId: newClient.socketId,
                        nickname: newClient.nickname
                    }); // callback
                    console.log('Just inserted ' + newClient.nickname + ' into active ');
                    break;
                case 'inactive':
                    result = await getDB().collection('activeUsers').deleteMany({ socketId: newClient.id });
                    console.log('Removed ' + newClient.id + ' into active ');
                    break;
                default:
                    break;
            }
            var clientsList = getDB().collection('activeUsers').find({}).toArray();
            return clientsList;
        } catch (err) {
            console.log(err + '. This occurred in setUserActiveStatus');
        }
    },

    updateActiveUser: async function updateActiveUser(newClient) {
        try {
            console.log('newClient: ', newClient);
            var result = await getDB().collection('activeUsers').updateOne({ customId: newClient.customId }, { $set: { socketId: newClient.socketId, nickname: newClient.nickname }
            });
            console.log('updateOne: ', result);
        } catch (err) {
            console.log(err + '. This occurred in updateActiveUser');
        }
    }

};

var formatResults = function formatResults(results) {
    array = [];
    results.forEach(function (result, index) {
        array[index] = {
            nickname: result.nickname,
            email: result.email,
            customId: result._id
        };
    });
    return array;
};

var emptyDB = function emptyDB(db) {
    console.log('deleting all');
    db.collection('users').deleteMany({});
};

var removePasswordFromResponse = function removePasswordFromResponse(res) {
    delete res[0].password;
    return res;
};