const {
    mongodbURI,
    tulp
} = require('../config.json');
const { MongoClient } = require('mongodb');

const mongodbClient = new MongoClient(mongodbURI, {
    useUnifiedTopology: true,
    keepAlive: true
});

mongodbClient.connect();

//----------------------------------------------
// tulp command

const tulpCollection = mongodbClient.db(tulp.dbName).collection(tulp.dbCollection);

//----------------------------------------------

module.exports = {
    mongodbClient : mongodbClient,
    tulp: tulpCollection
};
