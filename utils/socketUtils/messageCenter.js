const { searchActiveClientByCustomId } = require('./handleClientList');


const saveMessage = (type, data) => {
    switch (type) {
        case 'messageBank':
            console.log(`type:${type} ,message: ${data.message.content}`);
            break;
        case 'messageWaitingRoom':
            console.log(`type:${type} ,message: ${data.message.content}`);
            break;
        default: break;
    }
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
                if (foundClient) {
                    saveMessage('messageBank',data); // Save message in `messages` collection
                    io.sockets.sockets[foundClient.socketId].emit(event, data);
                } else {
                    saveMessage('messageWaitingRoom',data);  // Save message in `messages` collection
                    // Client offline, send message to messageWaitingRoom
                    // Send notification
                }
                break;
            default:
            return;
        }
    }
}
