const { searchActiveClientByCustomId } = require('./handleClientList');
const { getDB } = require('../mongoUtils');
const ObjectID = require('mongodb').ObjectID;

const formatMessageToSchema = (data) => {
    return {
        _id: new ObjectID(),
        senderId: data.senderId,
        receiverId: data.message.userTo.customId,
        dateSent: new Date(),
        content: data.message.content
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
        console.log(`${err}. This error occurred while insertin message in ${collection} collection`);
    }
}

const saveMessage = async (collection, data) => {
    const message = formatMessageToSchema(data);
    let respone = await insertMessage(collection, message);
    if (respone._id) {
        console.log(`Message successfully Inserted into ${collection}!`);
    }
    // getDB().collection(collection).deleteMany({});
    // getDB().collection(collection).find({}).toArray((err, result) => { console.log(result) });
    return respone;
}

sendSentMessageBackToSender = (io,data)=>{
    const sender = { customId:  data.senderId}
    const { foundClient } = searchActiveClientByCustomId(sender); 
    io.sockets.sockets[foundClient.socketId].emit('messageSent', data);
}

module.exports = {

    handleMessage: async (io, event, data) => {
        let { foundClient } = searchActiveClientByCustomId(data.message.userTo); //change here to 'data' when live
        const response = await saveMessage('messageBank', data);
        sendSentMessageBackToSender(io,response);
        if (foundClient) {
            io.sockets.sockets[foundClient.socketId].emit(event, response);
        } else {
            saveMessage('waitingRoom', data);
            // Send notification
        }
    },

    handleUserTyping: (io, event, data)  => {
        if(data.receiver){
            const { foundClient } = searchActiveClientByCustomId(data.receiver);
            if (foundClient) {
                io.sockets.sockets[foundClient.socketId].emit(event, data);
            }
        }
    },

    emitWaitingRoomMessages: (io, thisUser) => {
        getDB().collection('waitingRoom').find({ receiverId: thisUser.customId }).toArray((err, result) => {
            if (result && result.length > 0) {
                const { foundClient } = searchActiveClientByCustomId(thisUser); //change here to userTo when live
                io.sockets.sockets[foundClient.socketId].emit('incomingMessage', result);
            }
        });
    }
}
