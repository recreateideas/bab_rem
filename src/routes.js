// const { queryValidator, connectionValidator } = require('./validators');
// const {upload, moveFile} = require('./controllers/fileUpload');
// const http = require('http');
    // httpProxy = require('http-proxy');


module.exports = (app) =>{
    const users = require('./utils/userUtils');
    const {findMessages} = require('./utils/messageUtils');

    // app.get('/mongo', query.findAll);

    app.get('/',(req, res)=>{res.end('Baboon is coming!\n');});

    app.post('/users/login', /*queryValidator,*/ users.loginUser);

    app.post('/users/update', /*queryValidator,*/ users.updateUser);

    app.post('/users/register', /*queryValidator,*/ users.registerUser);

    app.get('/users/find/:type', users.findUsers);

    app.post('/messages/find/', findMessages);

    //add more!.. like delete('/mongo/:id',query.delete); 
};
