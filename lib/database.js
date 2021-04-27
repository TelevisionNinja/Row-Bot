const {
    mongodbURI,
    tulp
} = require('../config.json');
const { MongoClient } = require('mongodb');

const mongodbClient = new MongoClient(mongodbURI, {
    useUnifiedTopology: true,
    maxPoolSize: 32
});

mongodbClient.connect();

//----------------------------------------------
// tulp command

const tulpCollection = mongodbClient.db(tulp.dbName).collection(tulp.dbCollection);
const tulpWebhooks = mongodbClient.db(tulp.dbName).collection(tulp.webhookCollection);

//----------------------------------------------

module.exports = {
    mongodbClient : mongodbClient,
    tulp: tulpCollection,
    tulpWebhooks: tulpWebhooks
};
