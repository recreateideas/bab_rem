'use strict';

var _require = require('./handleClientList'),
    searchActiveClientByCustomId = _require.searchActiveClientByCustomId;

var _require2 = require('../mongoUtils'),
    getDB = _require2.getDB;

var ObjectID = require('mongodb').ObjectID;

var formatDate = function formatDate(date) {
    return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/') + ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
};

var formatMessageToSchema = function formatMessageToSchema(data) {
    // console.log(data);
    return {
        _id: new ObjectID(),
        senderId: data.senderId,
        receiverId: data.message.receiver.customId,
        dateSent: formatDate(new Date()),
        dateSentTimestamp: +new Date(),
        content: data.message.content,
        attachment: data.message.attachment
    };
};

var insertMessage = async function insertMessage(collection, message) {
    try {
        var responseData = void 0;
        await getDB().collection(collection).insertOne(message).then(function (result) {
            if (result.insertedCount > 0 && result.insertedId) {
                responseData = result.ops[0];
            } else if (result.insertedCount === 0 || !result.insertedId) responseData = { messageInserted: false };
            return responseData;
        });
        return responseData;
    } catch (err) {
        console.log('LOG::: ' + new Date() + ' -> ' + err + '. This error occurred while insertin message in ' + collection + ' collection');
    }
};

var saveMessage = async function saveMessage(collection, data) {
    var message = formatMessageToSchema(data);
    var respone = await insertMessage(collection, message);
    if (respone._id) {
        console.log('LOG::: ' + new Date() + ' -> Message successfully Inserted into ' + collection + '!');
    }
    // getDB().collection(collection).deleteMany({});
    // getDB().collection(collection).find({}).toArray((err, result) => { console.log(result) });
    return respone;
};

var sendSentMessageBackToSender = async function sendSentMessageBackToSender(io, data) {
    try {
        var sender = { customId: data.senderId };
        console.log('sending back to sender ', sender);
        // console.log(data);

        var _ref = await searchActiveClientByCustomId(sender),
            foundClient = _ref.foundClient;
        // console.log('found ->>',foundClient);


        if (foundClient) {
            io.sockets.sockets[foundClient.socketId].emit('messageSent', data);
        }
    } catch (err) {
        console.log('LOG::: ' + new Date() + ' Error -> ' + err);
    }
};

module.exports = {

    handleMessage: async function handleMessage(io, event, data) {
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
    },

    handleUserTyping: async function handleUserTyping(io, event, data) {
        if (data.receiver) {
            var _ref3 = await searchActiveClientByCustomId(data.receiver),
                foundClient = _ref3.foundClient;

            console.log('found receiver data:', data);
            if (foundClient) {
                io.sockets.sockets[foundClient.socketId].emit(event, data);
            }
        }
    },

    emitWaitingRoomMessages: async function emitWaitingRoomMessages(io, thisUser) {
        await getDB().collection('waitingRoom').find({ receiverId: thisUser.customId }).toArray(async function (err, result) {
            if (result && result.length > 0) {
                var _ref4 = await searchActiveClientByCustomId(thisUser),
                    foundClient = _ref4.foundClient; //change here to receiver when live


                io.sockets.sockets[foundClient.socketId].emit('incomingMessage', result);
                console.log('LOG::: ' + new Date() + ' -> ' + result.length + ' messages sent to ' + thisUser.nickname);
                await getDB().collection('waitingRoom').deleteMany({ receiverId: thisUser.customId }, async function (err, result) {
                    console.log('LOG::: ' + new Date() + ' -> deleted ' + result.deletedCount + ' messages from waitingRoom');
                });
            }
        });
    }
};