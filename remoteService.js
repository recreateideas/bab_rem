const express =require('express');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const { connectToDB }= require('./controllers/mongoUtil');

require('dotenv').config();

connectToDB(()=>{
    console.log('connected');
});

const port = process.env.REMOTE_PORT || 8001;



const app_remote = express();

app_remote.use(bodyParser.json());
app_remote.use(bodyParser.urlencoded({extended:true}));


require('./routes')(app_remote);

app_remote.use(errors());
app_remote.listen(port);

console.log(`Listening on ${process.env.REMOTE_HOST} port: ${port}`);
