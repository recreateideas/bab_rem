const parser = require('mongodb-query-parser');
const { getDB } = require('./mongoUtils');
const ObjectID = require('mongodb').ObjectID;
var logger = require('logger').createLogger('userUtils.log');

module.exports = {

    loginUser: (req, res) => {
        try {
            let responseData;
            logger.info(`::[userUtils]=> loginUser()=> loggin in user...`);
            /************** emptyDB(db); ************/
            getDB().collection('users').find(req.body.details).toArray((err, result) => {
                if (err) responseData = { userInserted: false, Error: `ERRL:10. This error occurred during login: ${err}` }
                else if (result && result.length > 0) {
                    logger.info(`::[userUtils]=> loginUser()=> user found, ${req.body.details.email}`);
                    const response = removePasswordFromResponse(result);
                    // update lastLoggedInDateTime

                    getDB().collection('users').updateOne(req.body.details, { $set: { lastLoggedInDateTime: new Date() } });
                    logger.info(`::[userUtils]=> loginUser()=> updating lastLoggedInDateTime`);
                    responseData = { userFound: true, userDetails: response, }
                    // add user to online users
                }
                else if (result && result.length === 0) {
                    logger.info(`::[userUtils]=> loginUser()=> User not found`);
                    responseData = { userFound: false, Error: 'User not found' }
                } else {
                    logger.warn(`::[messageCenter]=> loginUser()=>  Not an acceptable login result`);
                    responseData = { Error: `ERRL:16. Not an acceptable login result` }
                }
                res.json(responseData);
            });
        } catch (err) {
            logger.error(`::[messageCenter]=> loginUser()=> ${err}`);
            res.json({
                Error: `ERRL:22. This error occurred during login: ${err}`
            });
        }
        // res.json({findAll:true})
    },

    registerUser: (req, res) => {
        try {
            let responseData;
            logger.info(`::[userUtils]=> registerUser()=> registering user...`);
            getDB().collection('users').find(req.body.details).toArray((err, result) => {
                // logger.info(result);
                let userDetails = Object.assign({}, req.body.details, {
                    _id: new ObjectID(),
                    permissionGroup: 'user',
                    dateCreated: new Date(),
                    lastLoggedInDateTime: new Date(),
                });

                if (result && result.length === 0) {
                    logger.info(`::[userUtils]=> registerUser()=> This user is not registered yet`);
                    getDB().collection('users').insertOne(userDetails, (err, result) => {
                        const response = result.toJSON();
                        delete userDetails.password;
                        if (err) {
                            logger.error(`::[userUtils]=> registerUser()=> ${err}`);
                            responseData = { userInserted: false }
                        }
                        else if (response.ok === 1) {
                            logger.info(`::[userUtils]=> registerUser()=> This user has been inserted with id: ${userDetails._id}`);
                            responseData = Object.assign(userDetails, { userInserted: true })
                        }
                        else if (response.ok !== 1) {
                            logger.error(`::[userUtils]=> registerUser()=> an unknown error has happened. response.ok = ${response && response.ok}`);
                            responseData = { userInserted: false }
                        }
                        // add user to online users
                        res.json(responseData);
                    });
                    // getDB().listCollections().toArray((err, collections) => {logger.info(collections); });
                } else {
                    logger.info(`::[userUtils]=> registerUser()=> This user seems to be already registered.`);
                    res.json({ Error: 'This user seems to be already registered.' });
                }
            });
        }
        catch (err) {
            logger.error(`::[userUtils]=> registerUser()=> ${err}`);
            res.json({
                Error: `${err}. This occurred during query execution. Check the query parameters`
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const details = parser(JSON.stringify(req.body.data));
            logger.info(`::[userUtils]=> updateUser()=> Updating User data for ${req.body.user.email}`);
            // db.collection('users').find(req.body.user.email).toArray((err, result) => {logger.info(result);});
            const action = await getDB().collection('users').updateOne({ email: req.body.user.email }, { $set: details });
            if (action.result.ok === 1 && action.result.nModified > 0) {
                logger.info(`::[userUtils]=> updateUser()=> User updated`);
                res.json({ userUpdates: true });
            } else {
                logger.warn(`::[userUtils]=> updateUser()=> The user didn't get updated: ${JSON.stringify(action.result)}`);
                res.json({
                    Error: `The user didn't get updated: ${JSON.stringify(action.result)}`
                });
            }
        }
        catch (err) {
            logger.error(`::[userUtils]=> updateUser()=> ${err}.`);
            res.json({
                Error: `${err}. This occurred during user details update`
            });
        }
        // logger.info(req.body.user);

    },

    findUsers: async (req, res) => {
        try{
            const type = req.params.type;
            logger.info(`::[userUtils]=> findUsers()=> looking for type:${type} users`);
            switch (type) {
                case 'all':
                    getDB().collection('users').find({}).toArray((err, result) => {
                        if (err){
                            logger.error(`::[userUtils]=> findUsers()=> inside find({}) => ${err}`);
                            res.json({ Error: `${err}. This occurred while getting the list of all users` })
                        }
                        else {
                            logger.info(`::[userUtils]=> findUsers()=> found ${result && result.length ? result.length : '0'} users`);
                            res.json({ users: formatResults(result) })
                        }
                    });
                    break;
                default:
                    logger.info(`::[userUtils]=> findUsers()=> The user query is not of a correct type`);
                    res.json({ Error: `The user query is not of a correct type` })
                    break;
            }
        }catch(err){
            logger.error(`::[userUtils]=> findUsers()=> ${err}`);
        }

    },

    getAllActiveUsers: async () => {
        try{
            let allActiveUsers = await getDB().collection('activeUsers').find().toArray();
            logger.info(`::[userUtils]=> getAllActiveUsers()=> found ${allActiveUsers && allActiveUsers.length ? allActiveUsers.length : '0'} active users`);
            return allActiveUsers;
        }catch(err){
            logger.error(`::[userUtils]=> getAllActiveUsers()=> ${err}`);
        }
    },

    searchActiveUsersByCustomId: async newClient => {
        try{
            let activeUser = await getDB().collection('activeUsers').findOne({customId: newClient.customId});
            logger.info(`::[userUtils]=> searchActiveUsersByCustomId()=> found ${activeUser && activeUser.length ? activeUser.length : '0' } active users by customId`);
            return activeUser;
        }catch(err){
            logger.error(`::[userUtils]=> searchActiveUsersByCustomId()=> ${err}`);
            logger.info(`${err}. This occurred in searchActiveUsersByCustomId`);
        }
    },


    setUserActiveStatus: async(newClient,status)=>{
        let result;
        try{
            switch(status){
                case 'active':
                    logger.info(`::[userUtils]=> setUserActiveStatus()=> clearing all ${newClient.customId} users`);
                    await getDB().collection('activeUsers').deleteMany({ customId:newClient.customId})
                    result = await getDB().collection('activeUsers').insertOne({
                        customId:newClient.customId,
                        socketId:newClient.socketId,
                        nickname:newClient.nickname
                    });
                    // logger.info(`::[userUtils]=> setUserActiveStatus()=> inserted ${result.insertedId} into activeUsers`);
                    if(result.insertedId) {
                        logger.info(`::[userUtils]=> setUserActiveStatus()=> Just inserted ${newClient.nickname} into activeUsers.`);
                    } else {
                        logger.error(`::[userUtils]=> setUserActiveStatus()=> Something went wrong while inserting ${newClient.nickname} into activeUsers.`); 
                    }
                    break;
                case 'inactive':
                    result = await getDB().collection('activeUsers').deleteMany({ socketId: newClient.id})
                      logger.info(`::[userUtils]=> setUserActiveStatus()=> Removed ${newClient.id} into active `);
                    break;
                default: break;
            }
           const clientsList = getDB().collection('activeUsers').find({}).toArray();
           logger.info(`::[userUtils]=> setUserActiveStatus()=> There are ${clientsList && clientsList.length ? clientsList.length : '0' } active users`);
           return clientsList;
        }catch(err){
            logger.error(`::[userUtils]=> setUserActiveStatus()=> ${err}`); 
        }
    },

    updateActiveUser: async newClient => {
        try{
            logger.info('newClient: ',newClient);
            logger.info(`::[userUtils]=> updateActiveUser()`);
            const result = await getDB().collection('activeUsers').updateOne(
                { customId: newClient.customId, },
                { $set:
                    { socketId : newClient.socketId, nickname : newClient.nickname }
                }
             );
            if(result.modifiedCount > 0) {
                logger.info(`::[userUtils]=> updateActiveUser()=> Just updated ${newClient.customId} in activeUsers.`);
            } else {
                logger.error(`::[userUtils]=> updateActiveUser()=> Something went wrong while updating ${newClient.customId} in activeUsers.`); 
            }
        }catch(err){
            logger.error(`::[userUtils]=> updateActiveUser()=> ${err}`); 
        }
    }

}


const formatResults = results => {
    try{
        logger.info(`::[userUtils]=> formatResults()`);
        let array = [];
        results.forEach((result, index) => {
            array[index] = {
                nickname: result.nickname,
                email: result.email,
                customId: result._id,
            }
        });
        return array;
    } catch(err){
        logger.error(`::[userUtils]=> formatResults()=> ${err}`); 
    }

};

const emptyDB = db => {
    try{
        logger.info('deleting all');
        db.collection('users').deleteMany({});
    }catch(err){
        logger.error(`::[userUtils]=> emptyDB()=> ${err}`); 
    }

};

const removePasswordFromResponse = res => {
    delete res[0].password;
    return res;
}
