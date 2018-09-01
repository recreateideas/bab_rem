const parser = require('mongodb-query-parser');
const mongoUtil = require('./mongoUtil');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
    loginUser: (req, res) => {
        try {
            console.log('loggin in user...');
            // console.log(req.body);
            const db = mongoUtil.getDB();

            // emptyDB(db);

            db.collection('users').find(req.body.details).toArray((err, result) => {
                if (err) responseData = { userInserted: false, Error: `ERRL:10. This error occurred during login: ${err}` }
                else if (result && result.length > 0) {
                    const response = removePasswordFromResponse(result);
                    // update lastLoggedInDateTime
                    db.collection('users').updateOne(req.body.details, { $set: { lastLoggedInDateTime: new Date() } });

                    responseData = { userFound: true, userDetails: response, }
                }
                else if (result && result.length === 0) {
                    responseData = { userFound: false, Error: 'User not found' }
                } else {
                    responseData = { Error: `ERRL:16. Not an acceptable login result` }
                }
                res.json(responseData);
            });
        } catch (err) {
            res.json({
                Error: `ERRL:22. This error occurred during login: ${err}`
            });
        }
        // res.json({findAll:true})
    },

    registerUser: (req, res) => {
        try {
            console.log('registering user...');
            const db = mongoUtil.getDB();
            // console.log(req.body.details);
            db.collection('users').find(req.body.details).toArray((err, result) => {
                // console.log(result);
                let userDetails = Object.assign({}, req.body.details, {
                    _id: new ObjectID(),
                    permissionGroup: 'user',
                    dateCreated: new Date(),
                    lastLoggedInDateTime: new Date(),
                });
                // let ms = Date.parse(userDetails.dateCreated);
                // console.log(ms);
                if (result && result.length === 0) {
                    db.collection('users').insertOne(userDetails, (err, result) => {
                        const response = result.toJSON();
                        // console.log(response);
                        // console.log(userDetails);
                        delete userDetails.password;
                        if (err) responseData = { userInserted: false }
                        else if (response.ok === 1) {
                            responseData = Object.assign(userDetails, { userInserted: true })
                        }
                        else if (response.ok !== 1) responseData = { userInserted: false }
                        // console.log(responseData);
                        res.json(responseData);
                    });
                    db.listCollections().toArray((err, collections) => { console.log(collections); });
                } else {
                    res.json({ Error: 'This user seems to be already registered.' });
                }
            });
        }
        catch (err) {
            res.json({
                Error: `${err}. This occurred during query execution. Check the query parameters`
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const db = mongoUtil.getDB();
            const details = parser(JSON.stringify(req.body.data));
            console.log(req.body.user);
            db.collection('users').find(req.body.user.email).toArray((err, result) => {console.log(result);});
            const action = await db.collection('users').updateOne({email : req.body.user.email}, { $set: details });
            // console.log(action.result);
            if(action.result.ok === 1 && action.result.nModified > 0){
                res.json({userUpdates: true});
            } else {
                console.log(`The user didn't get updated: ${JSON.stringify(action.result)}`);
                res.json({
                    Error: `The user didn't get updated: ${JSON.stringify(action.result)}`
                });
            }
        }
        catch (err) {
            console.log(`${err}. This occurred during user details update`);
            res.json({
                Error: `${err}. This occurred during user details update`
            });
        }
        // console.log(req.body.user);

    }
}

const emptyDB = db => {
    console.log('deleting all');
    db.collection('users').deleteMany({});
};

const removePasswordFromResponse = res => {
    delete res[0].password;
    return res;
}
