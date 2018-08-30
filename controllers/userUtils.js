const parser = require('mongodb-query-parser');
const mongoUtil = require('./mongoUtil');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
    loginUser: (req, res) => {
        try{
            console.log('loggin in user...');
            // console.log(req.body);
            const db = mongoUtil.getDB();
            db.collection('users').find(req.body.details).toArray((err, result) => {
                if(err) responseData = {userInserted: false, Error: `ERRL:10. This error occurred during login: ${err}`}
                else if(result && result.length > 0){
                    const response = removePasswordFromResponse(result);
                    responseData = {userFound: true, userDetails: response,}
                }
                else if(result && result.length === 0){
                    responseData = {userFound: false, Error: 'User not found'}
                } else {
                    responseData = { Error: `ERRL:16. Not an acceptable login result`}
                }
                res.json(responseData);
            });
        } catch(err){
            res.json({
                Error: `ERRL:22. This error occurred during login: ${err}`
            });
        }
        // res.json({findAll:true})
    },

    registerUser: (req,res) => {
        try{
            console.log('registering user...');
            const db = mongoUtil.getDB();
            // console.log(req.body.details);
            db.collection('users').find(req.body.details).toArray((err, result) => {
                // console.log(result);
                let userDetails = Object.assign({},req.body.details,{_id : new ObjectID()});
                console.log(userDetails);
                if(result && result.length === 0) {
                    db.collection('users').insertOne(userDetails, (err, result) => {
                        const response = result.toJSON();
                        // console.log(response);
                        if(err) responseData = {userInserted: false}
                        else if(response.ok === 1) responseData = {userInserted: true}
                        else if(response.ok !== 1) responseData = {userInserted: false}
                        // console.log(responseData);
                        res.json(responseData);
                    });
                    db.listCollections().toArray((err, collections) => {console.log(collections);});
                } else {
                    res.json({Error: 'This user seems to be already registered.'});
                }
            });
        }
        catch(err){
            res.json({
                Error: `${err}. This occurred during query execution. Check the query parameters`
            });
        }
    }
}

const removePasswordFromResponse = res => {
    delete res[0].password;
    return res;
}
