"use strict";

require('dotenv').config();
const { updateActiveClientInfo, removeActiveClientFromList, getActiveClientList} = require('./handleClientList');
const io = require('socket.io')();

io.on('connection', (client) => {
    console.log('a user connected');

    client.on('updateClientInfo', data => {
        updateActiveClientInfo(client, data);
        const list = getActiveClientList();
        console.log('Active Clients List: ');
        console.log(list);
    });

    client.on('disconnect', () => {
        removeActiveClientFromList(client);
    });

});

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
console.log(`#-- Socket listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
