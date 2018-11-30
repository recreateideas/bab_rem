'use strict';

var parser = require('mongodb-query-parser');

var _require = require('./mongoUtils'),
    getDB = _require.getDB;

var ObjectID = require('mongodb').ObjectID;
var logger = require('logger').createLogger('messages.log');

module.exports = {

    findMessages: function findMessages(req, res) {
        try {
            logger.info('::[messageUtils]=> findMessages() => searching for messages for ' + req.body.userId);
            var responseData = void 0;
            var userId = req.body.userId;
            var db = getDB();
            db.collection('messageBank').find({ $or: [{ senderId: userId }, { receiverId: userId }] }).toArray(function (err, result) {
                if (err) responseData = { messagesFound: false, Error: 'This error occurred while looking for messages: ' + err };else if (result && result.length > 0) {
                    // const response = formatMessages(result);
                    logger.info('::[messageUtils]=> findMessages() => found ' + result.length + ' messages');
                    responseData = { messagesFound: true, messages: result };
                } else if (result && result.length === 0) {
                    logger.info('::[messageUtils]=> findMessages() => No Messages found');
                    responseData = { messagesFound: false, messages: result, Error: 'Messages not found' };
                } else {
                    logger.warn('::[messageUtils]=> findMessages() => Not an acceptable message query result for userId: ' + userId + '}');
                    responseData = { Error: 'ERRL:16. Not an acceptable message query result' };
                }
                // logger.info(responseData);
                res.json(responseData);
            });
        } catch (err) {
            logger.error('::[messageUtils]=> findMessages() => ' + err);
            res.json({
                Error: 'ERRL:22. This error occurred during login: ' + err
            });
        }
        // res.json({findAll:true})
    }
};