'use strict';

var _require = require('./handleClientList'),
    searchActiveClientByCustomId = _require.searchActiveClientByCustomId;

var _require2 = require('../mongoUtils'),
    getDB = _require2.getDB;

var ObjectID = require('mongodb').ObjectID;
var logger = require('logger').createLogger('messages.log');

var formatDate = function formatDate(date) {
    try {
        logger.info('::[messageCenter]=> formatDate()');
        return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
    } catch (err) {
        logger.error('::[messageCenter]=> formatDate()=> ' + err + '.');
    }
};

var formatMessageToSchema = function formatMessageToSchema(data) {
    try {
        logger.info('::[messageCenter]=> formatMessageToSchema()');
        return {
            _id: new ObjectID(),
            senderId: data.senderId,
            receiverId: data.message.receiver.customId,
            dateSent: formatDate(new Date()),
            dateSentTimestamp: +new Date(),
            content: data.message.content,
            attachment: data.message.attachment
        };
    } catch (err) {
        logger.error('::[messageCenter]=> formatMessageToSchema()=> ' + err + '.');
    }
};

var insertMessage = async function insertMessage(collection, message) {
    try {
        var responseData = void 0;
        await getDB().collection(collection).insertOne(message).then(function (result) {
            if (result.insertedCount > 0 && result.insertedId) {
                responseData = result.ops[0];
                logger.info('::[messageCenter]=> insertMessage()=> Message ' + result.insertedId + ' inserted in ' + collection);
            } else if (result.insertedCount === 0 || !result.insertedId) {
                responseData = { messageInserted: false };
                logger.info('::[messageCenter]=> insertMessage()=> Message ' + message + ' NOT inserted in ' + collection);
            }
            return responseData;
        });
        return responseData;
    } catch (err) {
        logger.error('::[messageCenter]=> formatDate()=> ' + err + '. This error occurred while insertin message in ' + collection + ' collection');
    }
};

var saveMessage = async function saveMessage(collection, data) {
    try {
        var message = formatMessageToSchema(data);
        var respone = await insertMessage(collection, message);
        if (respone._id) {
            logger.info('::[messageCenter]=> saveMessage()=> Message successfully Inserted into ' + collection + '!');
        }
        return respone;
    } catch (err) {
        logger.error('::[messageCenter]=> saveMessage()=> ' + err);
    }
};

var sendSentMessageBackToSender = async function sendSentMessageBackToSender(io, data) {
    try {
        var sender = { customId: data.senderId };
        logger.info('::[messageCenter]=> sendSentMessageBackToSender()=> sending message back to sender ', sender);

        var _ref = await searchActiveClientByCustomId(sender),
            foundClient = _ref.foundClient;

        if (foundClient) {
            io.sockets.sockets[foundClient.socketId].emit('messageSent', data);
        }
    } catch (err) {
        logger.error('::[messageCenter]=> sendSentMessageBackToSender()=> ' + err);
    }
};

module.exports = {

    handleMessage: async function handleMessage(io, event, data) {
        try {
            var _ref2 = await searchActiveClientByCustomId(data.message.receiver),
                foundClient = _ref2.foundClient; //change here to 'data' when live


            var response = await saveMessage('messageBank', data);
            await sendSentMessageBackToSender(io, response);
            if (foundClient) {
                io.sockets.sockets[foundClient.socketId].emit(event, response);
            } else {
                await saveMessage('waitingRoom', data);
                // Send notification
            }
        } catch (err) {
            logger.error('::handleMessage()=> ' + err);
        }
    },

    handleUserTyping: async function handleUserTyping(io, event, data) {
        try {
            if (data.receiver) {
                var _ref3 = await searchActiveClientByCustomId(data.receiver),
                    foundClient = _ref3.foundClient;

                if (foundClient) {
                    logger.info('::[messageCenter]=> handleUserTyping()=> found receiver ' + foundClient.customId);
                    io.sockets.sockets[foundClient.socketId].emit(event, data);
                    logger.info('::[messageCenter]=> handleUserTyping()=> sent userTyping to ' + foundClient.customId);
                }
            }
        } catch (err) {
            logger.error('::[messageCenter]=> handleUserTyping()=> ' + err);
        }
    },

    emitWaitingRoomMessages: async function emitWaitingRoomMessages(io, thisUser) {
        try {
            await getDB().collection('waitingRoom').find({ receiverId: thisUser.customId }).toArray(async function (err, result) {
                if (result && result.length > 0) {
                    var _ref4 = await searchActiveClientByCustomId(thisUser),
                        foundClient = _ref4.foundClient; //change here to receiver when live


                    io.sockets.sockets[foundClient.socketId].emit('incomingMessage', result);
                    logger.info('::[messageCenter]=> emitWaitingRoomMessages()=> ' + result.length + ' messages sent to ' + thisUser.nickname);
                    await getDB().collection('waitingRoom').deleteMany({ receiverId: thisUser.customId }, async function (err, result) {
                        logger.info('::[messageCenter]=> emitWaitingRoomMessages()=> deleted ' + result.deletedCount + ' messages from waitingRoom');
                    });
                }
            });
        } catch (err) {
            logger.error('::[messageCenter]=> emitWaitingRoomMessages()=> ' + err);
        }
    }
};