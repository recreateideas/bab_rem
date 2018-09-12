"use strict";

require('dotenv').config();
const { updateActiveClientInfo, removeActiveClientFromList, getActiveClientList } = require('./handleClientList');
const { handleMessage,otherUserIsTyping } = require('./messageCenter');

const io = require('socket.io')();

io.on('connection', (client) => {
    console.log('a user connected');
    emitAllUsers();
    console.log(io.clients);
    client.on('updateClientInfo', data => {
        console.log(data);
        updateActiveClientInfo(client, data);
        emitAllUsers();
    });

    client.on('getActiveUsers', () => {
        emitAllUsers();
    });

    client.on('thisUserIsTyping', data =>{
        // console.log(`${nickname} is typing....`);
        // io.emit('otherUserIsTyping',{nickname});
        // otherUserIsTyping({customId,nickname});
        console.log(`${data.nickname} is typing...`);
        handleMessage(io, 'otherUserIsTyping', data);
    });

    client.on('sendMessageToClient', data =>{
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
    io.emit('receiveActiveUsers',list);
};

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
console.log(`#-- Socket listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
