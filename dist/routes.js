'use strict';

// const { queryValidator, connectionValidator } = require('./validators');
// const {upload, moveFile} = require('./controllers/fileUpload');
// const http = require('http');
// httpProxy = require('http-proxy');


module.exports = function (app) {
    var users = require('./utils/userUtils');

    var _require = require('./utils/messageUtils'),
        findMessages = _require.findMessages;

    // app.get('/mongo', query.findAll);

    app.get('/', function (req, res) {
        res.end('Baboon is coming!\n');
    });

    app.post('/users/login', /*queryValidator,*/users.loginUser);

    app.post('/users/update', /*queryValidator,*/users.updateUser);

    app.post('/users/register', /*queryValidator,*/users.registerUser);

    app.get('/users/find/:type', users.findUsers);

    app.post('/messages/find/', findMessages);

    //add more!.. like delete('/mongo/:id',query.delete); 
};