"use strict";

require('dotenv').config();
const { updateActiveClientInfo, removeActiveClientFromList, getAllClientList} = require('./handleClientList');
const io = require('socket.io')();

io.on('connection', (client) => {
    console.log('a user connected');
    emitAllUsers();
    client.on('updateClientInfo', data => {
        console.log(data);
        updateActiveClientInfo(client, data);
        // const list = getAllClientList();
        // console.log('Active Clients List: ');
        // console.log(list);
        // io.emit('receiveAllUsers',list);
        emitAllUsers();
    });

    client.on('getAllUsers', () => {
        emitAllUsers();
    });

    client.on('disconnect', () => {
        removeActiveClientFromList(client);
        emitAllUsers();
    });

});

const emitAllUsers = () => {
    const list = getAllClientList();
    io.emit('receiveAllUsers',list);
};

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
console.log(`#-- Socket listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
