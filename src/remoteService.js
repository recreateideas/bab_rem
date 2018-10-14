const express =require('express');
const bodyParser = require('body-parser');
var logger = require('logger').createLogger('remoteService.log');
// const { errors } = require('celebrate');

const { connectToDB }= require('./utils/mongoUtils');

require('dotenv').config();

require('./utils/socketUtils/socketIOEvents');

connectToDB('king_louie',(data)=>{ //rename to KingLouie
    logger.info(`::[remoteService]=> connectToDB()=>  Connected to king_louie`,);
});

const port = process.env.REMOTE_PORT || 8001;

const app_remote = express();

app_remote.use(bodyParser.json());
app_remote.use(bodyParser.urlencoded({extended:true}));

require('./routes')(app_remote);

// app_remote.use(errors());
app_remote.listen(port);

logger.info(`::[remoteService]=> #--- Server Listening on ${process.env.REMOTE_HOST} port: ${port}`,); //<--------- DB !!
console.log(`#-- Server Listening on ${process.env.REMOTE_HOST} port: ${port}`);
