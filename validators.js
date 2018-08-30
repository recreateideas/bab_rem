const { celebrate, Joi } = require('celebrate');

exports.queryValidator = celebrate({
    body: Joi.object().keys({
        collection: Joi.string().required(),
        mongoObject: Joi.string().required(),
        queryType: Joi.string().required(),
        query: Joi.object().required()
    })
})

exports.connectionValidator = celebrate({
    body: Joi.object().keys({
        proxy: Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required()
        }),
        connectionType: Joi.string().required(),
        params: Joi.object().keys({
            connection: Joi.object().keys({
                isDBConnected: Joi.bool().required(),
                connectionStatus: Joi.string().required(),
                remoteHostName: Joi.string().required(),
                remoteMongoPort: Joi.string().required(),
                remoteMongoInstance: Joi.string().required(),
                db: Joi.string().required(),
                sshConnection: Joi.bool().required(),
                sshPath: Joi.string(),
                connectionMessage: Joi.string(),
                connectionWarning: Joi.string()
            }).required()
        }).required()
    })
});
