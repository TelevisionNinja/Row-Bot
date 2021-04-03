const { deleteTulp } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp
} = require('../../config.json');

module.exports = {
    names: deleteTulp.names,
    description: deleteTulp.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const tulpName = args.join(' ').trim();

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection('users');

            const userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            const newTulpArr = userData.tulps.filter(t => t.username !== tulpName);

            if (userData.tulps.length === newTulpArr.length) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            if (newTulpArr.length) {
                const updateDoc = {
                    $set: {
                        tulps: newTulpArr
                    }
                };

                await collection.updateOne(query, updateDoc, { upsert: false });
            }
            else {
                await collection.deleteOne(query);
            }
        }
        catch (error) {
            console.log(error);
            return;
        }
        finally {
            await client.close();
        }

        msg.channel.send(deleteTulp.confirmMsg);
    }
}