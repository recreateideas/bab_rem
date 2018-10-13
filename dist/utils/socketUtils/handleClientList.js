'use strict';

var _require = require('../userUtils'),
    searchActiveUsersByCustomId = _require.searchActiveUsersByCustomId,
    setUserActiveStatus = _require.setUserActiveStatus,
    updateActiveUser = _require.updateActiveUser,
    getAllActiveUsers = _require.getAllActiveUsers;

var clientsList = [];
var thisUser = {};

var searchActiveClientByCustomId = async function searchActiveClientByCustomId(newClient) {
    try {
        console.log('newClient: ', newClient);
        var activeUser = await searchActiveUsersByCustomId(newClient); //<--------- DB !!
        console.log('activeUser: ', activeUser); //<--------- DB !!
        return { foundClient: activeUser };
    } catch (err) {
        console.log('Error: ' + err + '. This error happened while searching for Active clients by custom Id.');
    }
};

var updateActiveClient = function updateActiveClient(newClient) {
    updateActiveUser(newClient); //<--------- DB !!
    console.log('Client updated: ' + newClient.customId + ', ' + clientsList[index].socketId);
    return newClient;
};

var insertActiveClient = async function insertActiveClient(newClient) {
    console.log('newClient', newClient);
    clientsList = await setUserActiveStatus(newClient, 'active'); //<--------- DB !!
    console.log('New client inserted: ' + newClient.socketId);
    console.log('Active Clients List: ');
    console.log(clientsList);
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
                updateActiveClient(newClient);
            } else {
                insertActiveClient(newClient);
            }
        } catch (err) {
            console.log('Error: ' + err + '. This error happened while updating client infos.');
        }
    },

    removeActiveClientFromList: async function removeActiveClientFromList(client) {
        console.log('Client.id ' + client.id + ' has disconnected');
        clientsList = await setUserActiveStatus(client, 'inactive');
        console.log('Active Clients List: ');
        console.log(clientsList);
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