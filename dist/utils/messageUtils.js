'use strict';

var parser = require('mongodb-query-parser');

var _require = require('./mongoUtils'),
    getDB = _require.getDB;

var ObjectID = require('mongodb').ObjectID;

module.exports = {

    findMessages: function findMessages(req, res) {
        console.log('##########################################');
        console.log(req.body);
        try {
            console.log('searching messages...');
            var userId = req.body.userId;
            var db = getDB();
            db.collection('messageBank').find({ $or: [{ senderId: userId }, { receiverId: userId }] }).toArray(function (err, result) {
                if (err) responseData = { messagesFound: false, Error: 'This error occurred while looking for messages: ' + err };else if (result && result.length > 0) {
                    // const response = formatMessages(result);
                    responseData = { messagesFound: true, messages: result
                        // add user to online users
                    };
                } else if (result && result.length === 0) {
                    responseData = { messagesFound: false, messages: result, Error: 'Messages not found' };
                } else {
                    responseData = { Error: 'ERRL:16. Not an acceptable message query result' };
                }
                // console.log(responseData);
                res.json(responseData);
            });
        } catch (err) {
            res.json({
                Error: 'ERRL:22. This error occurred during login: ' + err
            });
        }
        // res.json({findAll:true})
    }
};