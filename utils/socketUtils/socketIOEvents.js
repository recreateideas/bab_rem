"use strict";

require('dotenv').config();
const { updateActiveClientInfo, removeActiveClientFromList, getActiveClientList } = require('./handleClientList');
const { handleMessage, handleUserTyping,emitWaitingRoomMessages } = require('./messageCenter');

const io = require('socket.io')();

io.on('connection', (client) => {
    console.log('a user connected');
    emitAllUsers();
    // console.log(io.clients)
    client.on('updateClientInfo', async data => {
        console.log(data);
        updateActiveClientInfo(client, data);
        emitWaitingRoomMessages(io, data);
        emitAllUsers();
    });

    client.on('getActiveUsers', () => {
        emitAllUsers();
    });

    client.on('thisUserIsTyping', ({sender,receiver}) => {
        console.log(`${sender.nickname} is typing...`);
        handleUserTyping(io, 'otherUserIsTyping', {sender,receiver});
    });

    client.on('sendMessageToClient', data => {
        handleMessage(io, 'incomingMessage', data);
    });

    client.on('disconnect', () => {
        console.log('disconnect');
        removeActiveClientFromList(client);
        client.disconnect(true);
        emitAllUsers();
    });

});

const emitAllUsers = () => {
    const list = getActiveClientList();
    io.emit('receiveActiveUsers', list);
};

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
console.log(`#-- Socket listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
