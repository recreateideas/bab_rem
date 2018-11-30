'use strict';

var _require = require('../userUtils'),
    searchActiveUsersByCustomId = _require.searchActiveUsersByCustomId,
    setUserActiveStatus = _require.setUserActiveStatus,
    updateActiveUser = _require.updateActiveUser,
    getAllActiveUsers = _require.getAllActiveUsers;

var logger = require('logger').createLogger('remoteService.log');

var clientsList = [];
var thisUser = {};

var searchActiveClientByCustomId = async function searchActiveClientByCustomId(newClient) {
    try {
        logger.info('::[handleClientList]=> searchActiveClientByCustomId()=> newClient: ' + newClient.customId + ', nickname: ' + newClient.nickname);
        var activeUser = await searchActiveUsersByCustomId(newClient); //<--------- DB !!
        if (activeUser) {
            logger.info('::[handleClientList]=> searchActiveClientByCustomId()=> found active User: ' + activeUser.customId + ', nickname: ' + activeUser.nickname); //<--------- DB !!
        }
        return { foundClient: activeUser };
    } catch (err) {
        logger.error('::[handleClientList]=> searchActiveClientByCustomId() => ' + err);
    }
};

var updateActiveClient = function updateActiveClient(newClient) {
    try {
        updateActiveUser(newClient); //<--------- DB !!
        logger.info('::[handleClientList]=> updateActiveClient()=> Client updated: ' + newClient.customId + ', socketId: ' + clientsList[index].socketId);
        return newClient;
    } catch (err) {
        logger.error('::[handleClientList]=> updateActiveClient() => ' + err);
    }
};

var insertActiveClient = async function insertActiveClient(newClient) {
    try {
        clientsList = await setUserActiveStatus(newClient, 'active'); //<--------- DB !!
        logger.info('::[handleClientList]=> insertActiveClient()=> New client inserted, socketId: ' + newClient.socketId);
        logger.info('::[handleClientList]=> insertActiveClient()=> Active Clients List Length: ' + (clientsList && clientsList.length));
    } catch (err) {
        logger.error('::[handleClientList]=> insertActiveClient()=> ' + err);
    }
};

module.exports = {

    updateActiveClientInfo: function updateActiveClientInfo(client, data) {
        try {
            var newClient = {
                customId: data.customId,
                socketId: client.id,
                nickname: data.nickname
            };

            var _searchActiveClientBy = searchActiveClientByCustomId(newClient),
                foundClient = _searchActiveClientBy.foundClient;

            if (foundClient) {
                logger.info('::[handleClientList]=> updateActiveClientInfo()=> Updating ' + data.customId + ' info');
                updateActiveClient(newClient);
            } else {
                logger.info('::[handleClientList]=> updateActiveClientInfo()=> Inserting ' + data.customId + ' info');
                insertActiveClient(newClient);
            }
        } catch (err) {
            logger.error('::[handleClientList]=> updateActiveClientInfo()=> ' + err + '.');
        }
    },

    removeActiveClientFromList: async function removeActiveClientFromList(client) {
        try {
            logger.info('::[handleClientList]=> removeActiveClientFromList()=> Client.id ' + client.id + ' has disconnected');
            clientsList = await setUserActiveStatus(client, 'inactive');
            logger.info('::[handleClientList]=> removeActiveClientFromList()=> Active Clients List Length: ' + (clientsList && clientsList.length));
        } catch (err) {
            logger.error('::[handleClientList]=> removeActiveClientFromList()=> ' + err + '.');
        }
    },

    searchActiveClientByCustomId: searchActiveClientByCustomId,

    getActiveClientList: async function getActiveClientList() {
        clientsList = await getAllActiveUsers();
        return clientsList;
    },

    getThisUser: function getThisUser() {
        return thisUser;
    },

    setThisUser: function setThisUser(newUser) {
        thisUser = Object.assign({}, newUser);
        return;
    }
};