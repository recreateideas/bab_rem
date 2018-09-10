const { searchActiveClientByCustomId } = require('./handleClientList');

module.exports ={

    sendMessageToUser: (io,event,data) => {
        const userTo = data.userTo;
        const testUser = {customId:'5b8a62dc439959128c516f00'};
        const {foundClient} = searchActiveClientByCustomId(testUser); //change here to userTo when live
        console.log('data',data);
        io.sockets.sockets[foundClient.socketId].emit(event,data);
        console.log('found Client:');
        console.log(foundClient);
    }
}
