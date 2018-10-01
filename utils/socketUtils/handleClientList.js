const {searchActiveUsersByCustomId, setUserActiveStatus, updateActiveUser} = require('../userUtils');
let clientsList = [];
let thisUser = {};

const searchActiveClientByCustomId = async newClient => {
    try{
        let found = null, foundIndex = null;
        let activeUser = await searchActiveUsersByCustomId(newClient); //<--------- DB !!
        console.log('activeUser: ',activeUser); //<--------- DB !!
        clientsList.forEach((client, index) => {
            if (client.customId === newClient.customId) {
                found = client;
                foundIndex = index;
            }
        });
        // return {foundClient: activeUser};
        return {
            foundClient: found,
            foundIndex
        }
    }catch(err){
        console.log(`Error: ${err}. This error happened while searching for Active clients by custom Id.`);
    }
  
}

const updateActiveClient = (index, newClient) => {
    clientsList[index].socketId = newClient.socketId;
    clientsList[index].nickname = newClient.nickname;
    updateActiveUser(newClient);
    console.log('newClient: ',newClient);
    console.log(`Client updated: ${newClient.customId}, ${clientsList[index].socketId}`);
    return clientsList[index];
}

const insertActiveClient = newClient => {
    setUserActiveStatus(newClient,'active'); //<--------- DB !!
    clientsList.push(newClient);
    console.log(`New client inserted: ${newClient.socketId}`);
}



module.exports = {

    updateActiveClientInfo: (client, data) => {
        try{
            let newClient = {
                customId: data.customId,
                socketId: client.id,
                nickname: data.nickname
            }
            const { foundIndex } = searchActiveClientByCustomId(newClient);
            console.log(foundIndex);
            if(foundIndex !== null && foundIndex !== undefined) {
                updateActiveClient(foundIndex, newClient) 
            }
            else {
                insertActiveClient(newClient);
            }
        }
        catch(err){
            console.log(`Error: ${err}. This error happened while updating client infos.`);
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

    // findSocketId: () => {},

    getActiveClientList: () => {
        return clientsList;
    },

    getThisUser:()=>{
        return thisUser;
    },

    setThisUser:(newUser)=>{
        thisUser = Object.assign({},newUser);
        return;
    }
}
