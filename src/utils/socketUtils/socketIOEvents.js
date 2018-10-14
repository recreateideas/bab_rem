const dotenv = require('dotenv')
dotenv.config();
const { updateActiveClientInfo, removeActiveClientFromList, getActiveClientList } = require('./handleClientList');
const { handleMessage, handleUserTyping,emitWaitingRoomMessages } = require('./messageCenter');
var logger = require('logger').createLogger('socketEvents.log');

let io = require('socket.io')();

io.on('connection', async (client) => {

    logger.info(`[socketIOEvents]=> ::connection()=> a user connected`);
    await emitAllUsers();
    // logger.info(io.clients)
    client.on('updateClientInfo', async data => {
        try{
            logger.info(`[socketIOEvents]=> ::updateClientInfo()`);
            await updateActiveClientInfo(client, data);
            await emitWaitingRoomMessages(io, data);
            await emitAllUsers();
        }catch(err){
            logger.error(`::[handleClientList]=> updateClientInfo()=> ${err}.`);
        }

    });

    client.on('getActiveUsers', async () => {
        logger.info(`[socketIOEvents]=> ::getActiveUsers()`);
        await emitAllUsers();
    });

    client.on('thisUserIsTyping', async ({sender,receiver,activity}) => {
        logger.info(`[socketIOEvents]=> ::thisUserIsTyping()=> ${sender.nickname} has ${activity} typing...`);
        await handleUserTyping(io, 'otherUserIsTyping', {sender,receiver,activity});
    });

    client.on('sendMessageToClient', async data => {
        logger.info(`[socketIOEvents]=> ::sendMessageToClient()`);
        await handleMessage(io, 'incomingMessage', data);
    });

    client.on('disconnect', async () => {
        try{
            logger.info(`[socketIOEvents]=> ::disconnect() => client disconnected`);
            io.emit('shouldReconnect');
            await removeActiveClientFromList(client);
            client.disconnect(true);
            await emitAllUsers();
        }catch(err){
            logger.error(`::[handleClientList]=> disconnect()=> ${err}.`);
        }

    });

});

const emitAllUsers = async () => {
    const list = await getActiveClientList();
    logger.info(`[socketIOEvents]=> ::emitAllUsers()`);
    io.emit('receiveActiveUsers', list);
};

const socket_port = process.env.SOCKET_PORT || 8011;


io.listen(socket_port);
logger.info(`#---- Socket connected and listening on ${process.env.REMOTE_HOST} port: ${socket_port}`);
