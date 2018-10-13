"use strict";

require('dotenv').config();

var _require = require('./handleClientList'),
    updateActiveClientInfo = _require.updateActiveClientInfo,
    removeActiveClientFromList = _require.removeActiveClientFromList,
    getActiveClientList = _require.getActiveClientList;

var _require2 = require('./messageCenter'),
    handleMessage = _require2.handleMessage,
    handleUserTyping = _require2.handleUserTyping,
    emitWaitingRoomMessages = _require2.emitWaitingRoomMessages;

var io = require('socket.io')();

io.on('connection', async function (client) {
    console.log('a user connected');
    await emitAllUsers();
    // console.log(io.clients)
    client.on('updateClientInfo', async function (data) {
        console.log(data);
        await updateActiveClientInfo(client, data);
        await emitWaitingRoomMessages(io, data);
        await emitAllUsers();
    });

    client.on('getActiveUsers', async function () {
        await emitAllUsers();
    });

    client.on('thisUserIsTyping', async function (_ref) {
        var sender = _ref.sender,
            receiver = _ref.receiver,
            activity = _ref.activity;

        console.log(sender.nickname + ' has ' + activity + ' typing...');
        await handleUserTyping(io, 'otherUserIsTyping', { sender: sender, receiver: receiver, activity: activity });
    });

    client.on('sendMessageToClient', async function (data) {
        await handleMessage(io, 'incomingMessage', data);
    });

    client.on('disconnect', async function () {
        console.log('disconnect');
        io.emit('shouldReconnect');
        await removeActiveClientFromList(client);
        client.disconnect(true);
        await emitAllUsers();
    });
});

var emitAllUsers = async function emitAllUsers() {
    var list = await getActiveClientList();
    io.emit('receiveActiveUsers', list);
};

var socket_port = process.env.SOCKET_PORT || 8011;

io.listen(socket_port);
console.log('#-- Socket listening on ' + process.env.REMOTE_HOST + ' port: ' + socket_port);