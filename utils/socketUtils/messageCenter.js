const { searchActiveClientByCustomId } = require('./handleClientList');
const { getDB } = require('../mongoUtils');
const ObjectID = require('mongodb').ObjectID;

const formatDate = (date) => {
    return [date.getMonth() + 1,
    date.getDate(),
    date.getFullYear()].join('/') + ' ' +
        [date.getHours(),
        date.getMinutes(),
        date.getSeconds()].join(':');
}

const formatMessageToSchema = (data) => {
    console.log(data);
    return {
        _id: new ObjectID(),
        senderId: data.senderId,
        receiverId: data.message.userTo.customId,
        dateSent: formatDate(new Date()),
        dateSentTimestamp: +new Date(),
        content: data.message.content,
        attachment: data.message.attachment,
    };
}

const insertMessage = async (collection, message) => {
    try {
        let responseData;
        await getDB().collection(collection).insertOne(message).then(result => {
            if (result.insertedCount > 0 && result.insertedId) {
                responseData = result.ops[0];
            }
            else if (result.insertedCount === 0 || !result.insertedId) responseData = { messageInserted: false }
            return responseData;
        });
        return responseData;
    } catch (err) {
        console.log(`LOG::: ${new Date()} -> ${err}. This error occurred while insertin message in ${collection} collection`);
    }
}

const saveMessage = async (collection, data) => {
    const message = formatMessageToSchema(data);
    let respone = await insertMessage(collection, message);
    if (respone._id) {
        console.log(`LOG::: ${new Date()} -> Message successfully Inserted into ${collection}!`);
    }
    // getDB().collection(collection).deleteMany({});
    // getDB().collection(collection).find({}).toArray((err, result) => { console.log(result) });
    return respone;
}

sendSentMessageBackToSender = async (io, data) => {
    const sender = { customId: data.senderId }
    const { foundClient } = await searchActiveClientByCustomId(sender);
    if(foundClient){
        io.sockets.sockets[foundClient.socketId].emit('messageSent', data);
    }
}

module.exports = {

    handleMessage: async (io, event, data) => {
        let { foundClient } = await searchActiveClientByCustomId(data.message.userTo); //change here to 'data' when live
        const response = await saveMessage('messageBank', data);
        await sendSentMessageBackToSender(io, response);
        if (foundClient) {
            io.sockets.sockets[foundClient.socketId].emit(event, response);
        } else {
            await saveMessage('waitingRoom', data);
            // Send notification
        }
    },

    handleUserTyping: async (io, event, data) => {
        if (data.receiver) {
            const { foundClient } = await searchActiveClientByCustomId(data.receiver);
            if (foundClient) {
                io.sockets.sockets[foundClient.socketId].emit(event, data);
            }
        }
    },

    emitWaitingRoomMessages: async (io, thisUser) => {
        await getDB().collection('waitingRoom').find({ receiverId: thisUser.customId }).toArray(async (err, result) => {
            if (result && result.length > 0) {
                const { foundClient } = await searchActiveClientByCustomId(thisUser); //change here to userTo when live
                io.sockets.sockets[foundClient.socketId].emit('incomingMessage', result);
                console.log(`LOG::: ${new Date()} -> ${result.length} messages sent to ${thisUser.nickname}`);
                await getDB().collection('waitingRoom').deleteMany({ receiverId: thisUser.customId }, async (err, result) => {
                    console.log(`LOG::: ${new Date()} -> deleted ${result.deletedCount} messages from waitingRoom`);
                });
               
            }
        });
    }
}
