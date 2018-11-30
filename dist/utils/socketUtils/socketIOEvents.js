'use strict';

var dotenv = require('dotenv');
dotenv.config();

var _require = require('./handleClientList'),
    updateActiveClientInfo = _require.updateActiveClientInfo,
    removeActiveClientFromList = _require.removeActiveClientFromList,
    getActiveClientList = _require.getActiveClientList;

var _require2 = require('./messageCenter'),
    handleMessage = _require2.handleMessage,
    handleUserTyping = _require2.handleUserTyping,
    emitWaitingRoomMessages = _require2.emitWaitingRoomMessages;

var logger = require('logger').createLogger('socketEvents.log');

var io = require('socket.io')();

io.on('connection', async function (client) {

    logger.info('[socketIOEvents]=> ::connection()=> a user connected');
    io.emit('shouldReconnect');
    await emitAllUsers();
    // logger.info(io.clients)
    client.on('updateClientInfo', async function (data) {
        try {
            logger.info('[socketIOEvents]=> ::updateClientInfo()');
            await updateActiveClientInfo(client, data);
            await emitWaitingRoomMessages(io, data);
            await emitAllUsers();
        } catch (err) {
            logger.error('::[handleClientList]=> updateClientInfo()=> ' + err + '.');
        }
    });

    client.on('getActiveUsers', async function () {
        logger.info('[socketIOEvents]=> ::getActiveUsers()');
        await emitAllUsers();
    });

    client.on('thisUserIsTyping', async function (_ref) {
        var sender = _ref.sender,
            receiver = _ref.receiver,
            activity = _ref.activity;

        logger.info('[socketIOEvents]=> ::thisUserIsTyping()=> ' + sender.nickname + ' has ' + activity + ' typing...');
        await handleUserTyping(io, 'otherUserIsTyping', { sender: sender, receiver: receiver, activity: activity });
    });

    client.on('sendMessageToClient', async function (data) {
        logger.info('[socketIOEvents]=> ::sendMessageToClient()');
        await handleMessage(io, 'incomingMessage', data);
    });

    client.on('disconnect', async function () {
        try {
            logger.info('[socketIOEvents]=> ::disconnect() => client disconnected');
            io.emit('shouldReconnect');
            await removeActiveClientFromList(client);
            // client.disconnect(true);
            await emitAllUsers();
        } catch (err) {
            logger.error('::[handleClientList]=> disconnect()=> ' + err + '.');
        }
    });
});

var emitAllUsers = async function emitAllUsers() {
    var list = await getActiveClientList();
    logger.info('[socketIOEvents]=> ::emitAllUsers()');
    io.emit('receiveActiveUsers', list);
};

var socket_port = process.env.SOCKET_PORT || 8011;

io.listen(socket_port);
logger.info('#---- Socket connected and listening on ' + process.env.REMOTE_HOST + ' port: ' + socket_port);