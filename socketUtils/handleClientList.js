let clientsList = [];

const searchActiveClientByCustomId = newClient => {
    let found = null, foundIndex = null;
    clientsList.forEach((client, index) => {
        if (client.customId === newClient.customId) {
            found = client;
            foundIndex = index;
            // console.log('foundIndex_top',foundIndex);
        }
    });
    return {
        foundClient: found,
        foundIndex
    }
}

const updateActiveClient = (index, newClient) => {
    clientsList[index].socketId = newClient.socketId;
    clientsList[index].nickname = newClient.nickname;
    console.log(`Client updated: ${newClient.customId}, ${clientsList[index].socketId}`);
    return clientsList[index];
}

const insertActiveClient = newClient => {
    clientsList.push(newClient);
    console.log(`New client inserted: ${newClient.socketId}`);
}



module.exports = {

    updateActiveClientInfo: (client, data) => {
        let newClient = {
            customId: data.customId,
            socketId: client.id,
            nickname: data.nickname
        }
        const { foundIndex } = searchActiveClientByCustomId(newClient);
        if(foundIndex !== null) {
            updateActiveClient(foundIndex, newClient) 
        }
        else {
            insertActiveClient(newClient);
        }
    },

    removeActiveClientFromList: client => {
        console.log(`Client.id ${client.id} has disconnected`);
        const { foundIndex } = searchActiveClientByCustomId(client);
        clientsList.splice(foundIndex, 1);
        console.log('Active Clients List: ');
        console.log(clientsList);
    },

    searchActiveClientByCustomId,

    findSocketId: () => {},

    getActiveClientList: () => {
        return clientsList;
    }
}
