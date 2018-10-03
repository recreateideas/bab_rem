const {searchActiveUsersByCustomId, setUserActiveStatus, updateActiveUser, getAllActiveUsers} = require('../userUtils');
let clientsList = [];
let thisUser = {};

const searchActiveClientByCustomId = async newClient => {
    try{
        let activeUser = await searchActiveUsersByCustomId(newClient); //<--------- DB !!
        // console.log('activeUser: ',activeUser); //<--------- DB !!
        return {foundClient: activeUser};
    }catch(err){
        console.log(`Error: ${err}. This error happened while searching for Active clients by custom Id.`);
    }
  
}

const updateActiveClient = (newClient) => {
    updateActiveUser(newClient);  //<--------- DB !!
    console.log(`Client updated: ${newClient.customId}, ${clientsList[index].socketId}`);
    return newClient;
}

const insertActiveClient = async newClient => {
    clientsList = await setUserActiveStatus(newClient,'active'); //<--------- DB !!
    console.log(`New client inserted: ${newClient.socketId}`);
    console.log('Active Clients List: ');
    console.log(clientsList);

}



module.exports = {

    updateActiveClientInfo: (client, data) => {
        try{
            let newClient = {
                customId: data.customId,
                socketId: client.id,
                nickname: data.nickname
            }
            const { foundClient } = searchActiveClientByCustomId(newClient);
            if(foundClient) {
                updateActiveClient(newClient) 
            }
            else {
                insertActiveClient(newClient);
            }
        }
        catch(err){
            console.log(`Error: ${err}. This error happened while updating client infos.`);
        }
    },

    removeActiveClientFromList: async client => {
        console.log(`Client.id ${client.id} has disconnected`);
        clientsList = await setUserActiveStatus(client,'inactive');
        console.log('Active Clients List: ');
        console.log(clientsList);
    },

    searchActiveClientByCustomId,

    getActiveClientList: async () => {
        clientsList = await getAllActiveUsers();
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
