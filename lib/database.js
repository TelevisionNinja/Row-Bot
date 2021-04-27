import { default as config } from '../config.json';
import mongo from 'mongodb';

const mongodbURI = config.mongodbURI,
    tulpConfig = config.tulp,
    MongoClient = mongo.MongoClient;

export const mongodbClient = new MongoClient(mongodbURI, {
    useUnifiedTopology: true,
    maxPoolSize: 32
});

mongodbClient.connect();

//----------------------------------------------
// tulp command

export const tulp = mongodbClient.db(tulpConfig.dbName).collection(tulpConfig.dbCollection);
export const tulpWebhooks = mongodbClient.db(tulpConfig.dbName).collection(tulpConfig.webhookCollection);
