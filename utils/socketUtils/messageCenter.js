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
        const db = getDB();
        await db.collection(collection).insertOne(message, (err, result) => {
            const response = result.toJSON();
            if (err) responseData = { messageInserted: false }
            else if (response.ok === 1) {
                responseData = Object.assign(message, { messageInserted: true })
            }
            else if (response.ok !== 1) responseData = { messageInserted: false }
            // console.log(responseData);
            return responseData;
        });
        console.log(responseData);
        // console.log(mess);
        return responseData;
    } catch (err) {
        console.log(`${err}. This error occurred while insertin message in ${collection} collection`);
    }
}

const saveMessage = async (collection, data) => {
    const message = formatMessageToSchema(data);
    let savedMessage = await insertMessage(collection, message);
    // const db = getDB();
    // db.collection(collection).find({}).toArray((err, result) => {console.log(result);});
    console.log('mess ---> ',savedMessage);
}

    module.exports = {

        handleMessage: (io, event, data) => {
            const testUser = { customId: '5b8a62dc439959128c516f00' };
            const { foundClient } = searchActiveClientByCustomId(testUser); //change here to userTo when live
            switch (event) {
                case 'otherUserIsTyping':
                    if (foundClient) {
                        io.sockets.sockets[foundClient.socketId].emit(event, data);
                    }
                    break;
                case 'incomingMessage':
                    saveMessage('messageBank', data); // Save message in `messages` collection
                    if (foundClient) {
                        io.sockets.sockets[foundClient.socketId].emit(event, data);
                    } else {
                        saveMessage('waitingRoom', data);  // Save message in `waitingRoom` collection
                        // Send notification
                    }
                    break;
                default:
                    return;
            }
        }
    }
