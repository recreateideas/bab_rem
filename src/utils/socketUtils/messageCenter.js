const { searchActiveClientByCustomId } = require('./handleClientList');
const { getDB } = require('../mongoUtils');
const ObjectID = require('mongodb').ObjectID;
var logger = require('logger').createLogger('messages.log');

const formatDate = (date) => {
    try{
        logger.info(`::[messageCenter]=> formatDate()`);
        return [date.getMonth() + 1,
        date.getDate(),
        date.getFullYear()].join('/') + ' ' +
            [date.getHours(),
            date.getMinutes(),
            date.getSeconds()].join(':');
    }
    catch(err){
        logger.error(`::[messageCenter]=> formatDate()=> ${err}.`);
    }

}

const formatMessageToSchema = (data) => {
    try{
        logger.info(`::[messageCenter]=> formatMessageToSchema()`);
        return {
            _id: new ObjectID(),
            senderId: data.senderId,
            receiverId: data.message.receiver.customId,
            dateSent: formatDate(new Date()),
            dateSentTimestamp: +new Date(),
            content: data.message.content,
            attachment: data.message.attachment,
        };
    }catch(err){
        logger.error(`::[messageCenter]=> formatMessageToSchema()=> ${err}.`);
    }

}

const insertMessage = async (collection, message) => {
    try {
        let responseData;
        await getDB().collection(collection).insertOne(message).then(result => {
            if (result.insertedCount > 0 && result.insertedId) {
                responseData = result.ops[0];
                logger.info(`::[messageCenter]=> insertMessage()=> Message ${result.insertedId} inserted in ${collection}`);
            }
            else if (result.insertedCount === 0 || !result.insertedId){
                responseData = { messageInserted: false }
                logger.info(`::[messageCenter]=> insertMessage()=> Message ${message} NOT inserted in ${collection}`);
            }
            return responseData;
        });
        return responseData;
    } catch (err) {
        logger.error(`::[messageCenter]=> formatDate()=> ${err}. This error occurred while insertin message in ${collection} collection`);
    }
}

const saveMessage = async (collection, data) => {
    try{
        const message = formatMessageToSchema(data);
        let respone = await insertMessage(collection, message);
        if (respone._id) {
            logger.info(`::[messageCenter]=> saveMessage()=> Message successfully Inserted into ${collection}!`);
        }
        return respone;
    }catch(err){
        logger.error(`::[messageCenter]=> saveMessage()=> ${err}`); 
    }
   
}

const sendSentMessageBackToSender = async (io, data) => {
    try{
        const sender = { customId: data.senderId }
        logger.info('::[messageCenter]=> sendSentMessageBackToSender()=> sending message back to sender ',sender);
        const { foundClient } = await searchActiveClientByCustomId(sender);
        if(foundClient){
            io.sockets.sockets[foundClient.socketId].emit('messageSent', data);
        }
    } catch(err){
        logger.error(`::[messageCenter]=> sendSentMessageBackToSender()=> ${err}`);
    }

}

module.exports = {

    handleMessage: async (io, event, data) => {
        try{
            let { foundClient } = await searchActiveClientByCustomId(data.message.receiver); //change here to 'data' when live
            const response = await saveMessage('messageBank', data);
            await sendSentMessageBackToSender(io, response);
            if (foundClient) {
                io.sockets.sockets[foundClient.socketId].emit(event, response);
            } else {
                await saveMessage('waitingRoom', data);
                // Send notification
            }
        }catch(err){
            logger.error(`::handleMessage()=> ${err}`);
        }

    },

    handleUserTyping: async (io, event, data) => {
        try{
            if (data.receiver) {
                const { foundClient } = await searchActiveClientByCustomId(data.receiver);
                if (foundClient) {
                    logger.info(`::[messageCenter]=> handleUserTyping()=> found receiver ${foundClient.customId}`);
                    io.sockets.sockets[foundClient.socketId].emit(event, data);
                    logger.info(`::[messageCenter]=> handleUserTyping()=> sent userTyping to ${foundClient.customId}`);
                }
            }
        }catch(err){
            logger.error(`::[messageCenter]=> handleUserTyping()=> ${err}`);
        }

    },

    emitWaitingRoomMessages: async (io, thisUser) => {
        try{
            await getDB().collection('waitingRoom').find({ receiverId: thisUser.customId }).toArray(async (err, result) => {
                if (result && result.length > 0) {
                    const { foundClient } = await searchActiveClientByCustomId(thisUser); //change here to receiver when live
                    io.sockets.sockets[foundClient.socketId].emit('incomingMessage', result);
                    logger.info(`::[messageCenter]=> emitWaitingRoomMessages()=> ${result.length} messages sent to ${thisUser.nickname}`);
                    await getDB().collection('waitingRoom').deleteMany({ receiverId: thisUser.customId }, async (err, result) => {
                        logger.info(`::[messageCenter]=> emitWaitingRoomMessages()=> deleted ${result.deletedCount} messages from waitingRoom`);
                    });
                   
                }
            });
        }catch(err){
            logger.error(`::[messageCenter]=> emitWaitingRoomMessages()=> ${err}`);
        }
    }
}
