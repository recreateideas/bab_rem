"use strict";

var express = require('express');
var bodyParser = require('body-parser');
// const { errors } = require('celebrate');

var _require = require('./utils/mongoUtils'),
    connectToDB = _require.connectToDB;

require('dotenv').config();

require('./utils/socketUtils/socketIOEvents');

connectToDB('users', function () {
    //rename to KingLouie
    console.log('connected');
});

var port = process.env.REMOTE_PORT || 8001;

var app_remote = express();

app_remote.use(bodyParser.json());
app_remote.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app_remote);

// app_remote.use(errors());
app_remote.listen(port);

console.log('#-- Server Listening on ' + process.env.REMOTE_HOST + ' port: ' + port);