const {searchActiveUsersByCustomId, setUserActiveStatus, updateActiveUser, getAllActiveUsers} = require('../userUtils');
var logger = require('logger').createLogger('remoteService.log');

let clientsList = [];
let thisUser = {};

const searchActiveClientByCustomId = async newClient => {
    try{
        logger.info(`::searchActiveClientByCustomId()=> newClient: ${newClient.customId}, nickname: ${newClient.nickname}`);
        let activeUser = await searchActiveUsersByCustomId(newClient); //<--------- DB !!
        logger.info(`::searchActiveClientByCustomId()=> found active User: ${activeUser.customId}, nickname: ${activeUser.nickname}`,); //<--------- DB !!
        return {foundClient: activeUser};
    }catch(err){
        logger.error(`::searchActiveClientByCustomId() => ${err}`);
    }
  
}

const updateActiveClient = (newClient) => {
    try{
        updateActiveUser(newClient);  //<--------- DB !!
        logger.info(`::updateActiveClient()=> Client updated: ${newClient.customId}, socketId: ${clientsList[index].socketId}`);
        return newClient;
    }
    catch(err){
        logger.error(`::updateActiveClient() => ${err}`);
    }
}

const insertActiveClient = async newClient => {
    try{
        clientsList = await setUserActiveStatus(newClient,'active'); //<--------- DB !!
        logger.info(`::insertActiveClient()=> New client inserted, socketId: ${newClient.socketId}`);
        logger.info(`::insertActiveClient()=> Active Clients List Length: ${clientsList && clientsList.length}`);
    }
    catch(err){
        logger.error(`::insertActiveClient()=> ${err}`);
    }

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
            logger.info(`Error: ${err}. This error happened while updating client infos.`);
        }
    },

    removeActiveClientFromList: async client => {
        logger.info(`Client.id ${client.id} has disconnected`);
        clientsList = await setUserActiveStatus(client,'inactive');
        logger.info('Active Clients List: ');
        logger.info(clientsList);
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
