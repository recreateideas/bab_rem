// const { queryValidator, connectionValidator } = require('./validators');
// const {upload, moveFile} = require('./controllers/fileUpload');
// const http = require('http');
    // httpProxy = require('http-proxy');


module.exports = (app) =>{
    const users = require('./controllers/userUtils');


    // app.get('/mongo', query.findAll);

    app.post('/users/login', /*queryValidator,*/ users.loginUser);

    app.post('/users/register', /*queryValidator,*/ users.registerUser);

    //add more!.. like delete('/mongo/:id',query.delete); 
};
