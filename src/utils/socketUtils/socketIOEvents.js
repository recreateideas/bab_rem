const dotenv = require('dotenv')
dotenv.config();
const { updateActiveClientInfo, removeActiveClientFromList, getActiveClientList } = require('./handleClientList');
const { handleMessage, handleUserTyping,emitWaitingRoomMessages } = require('./messageCenter');

let io = require('socket.io')();

io.on('connection', async (client) => {
    console.log('a user connected');
    await emitAllUsers();
    // console.log(io.clients)
    client.on('updateClientInfo', async data => {
        console.log(data);
        await updateActiveClientInfo(client, data);
        await emitWaitingRoomMessages(io, data);
        await emitAllUsers();
    });

    client.on('getActiveUsers', async () => {
        await emitAllUsers();
    });

    client.on('thisUserIsTyping', async ({sender,receiver,activity}) => {
        console.log(`${sender.nickname} has ${activity} typing...`);
        await handleUserTyping(io, 'otherUserIsTyping', {sender,receiver,activity});
    });

    client.on('sendMessageToClient', async data => {
        await handleMessage(io, 'incomingMessage', data);
    });

    client.on('disconnect', async () => {
        console.log('disconnect');
        io.emit('shouldReconnect');
        await removeActiveClientFromList(client);
        client.disconnect(true);
        await emitAllUsers();
    });

});

const emitAllUsers = async () => {
    const list = await getActiveClientList();
    io.emit('receiveActiveUsers', list);
};

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
console.log(`#-- Socket listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
