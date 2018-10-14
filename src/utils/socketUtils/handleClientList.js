const {searchActiveUsersByCustomId, setUserActiveStatus, updateActiveUser, getAllActiveUsers} = require('../userUtils');
var logger = require('logger').createLogger('remoteService.log');

let clientsList = [];
let thisUser = {};

const searchActiveClientByCustomId = async newClient => {
    try{
        if(newClient && newClient.customId){
            logger.info(`::[handleClientList]=> searchActiveClientByCustomId()=> newClient: ${newClient.customId}, nickname: ${newClient.nickname}`);
            let activeUser = await searchActiveUsersByCustomId(newClient); //<--------- DB !!
            if(activeUser){
                logger.info(`::[handleClientList]=> searchActiveClientByCustomId()=> found active User: ${activeUser.customId}, nickname: ${activeUser.nickname}`,); //<--------- DB !!
                return {foundClient: activeUser};
            }
        }
    }catch(err){
        logger.error(`::[handleClientList]=> searchActiveClientByCustomId() => ${err}`);
    }
  
}

const updateActiveClient = (newClient) => {
    try{
        if(newClient && newClient.customId){
            updateActiveUser(newClient);  //<--------- DB !!
            logger.info(`::[handleClientList]=> updateActiveClient()=> Client updated: ${newClient.customId}, socketId: ${clientsList[index].socketId}`);
            return newClient;
        }
    }
    catch(err){
        logger.error(`::[handleClientList]=> updateActiveClient() => ${err}`);
    }
}

const insertActiveClient = async newClient => {
    try{
        if(newClient){
            clientsList = await setUserActiveStatus(newClient,'active'); //<--------- DB !!
            logger.info(`::[handleClientList]=> insertActiveClient()=> New client inserted, socketId: ${newClient.socketId}`);
            logger.info(`::[handleClientList]=> insertActiveClient()=> Active Clients List Length: ${clientsList && clientsList.length}`);
        }
    }
    catch(err){
        logger.error(`::[handleClientList]=> insertActiveClient()=> ${err}`);
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
                logger.info(`::[handleClientList]=> updateActiveClientInfo()=> Updating ${data.customId} info`);
                updateActiveClient(newClient) 
            }
            else {
                logger.info(`::[handleClientList]=> updateActiveClientInfo()=> Inserting ${data.customId} info`);
                insertActiveClient(newClient);
            }
        }
        catch(err){
            logger.error(`::[handleClientList]=> updateActiveClientInfo()=> ${err}.`);
        }
    },

    removeActiveClientFromList: async client => {
        try{
            logger.info(`::[handleClientList]=> removeActiveClientFromList()=> Client.id ${client.id} has disconnected`);
            clientsList = await setUserActiveStatus(client,'inactive');
            logger.info(`::[handleClientList]=> removeActiveClientFromList()=> Active Clients List Length: ${clientsList && clientsList.length}`);
    
        } catch(err){
            logger.error(`::[handleClientList]=> removeActiveClientFromList()=> ${err}.`);
        }
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
