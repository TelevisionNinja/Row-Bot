const { deleteTulp } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const { mongodbURI } = require('../../config.json');

module.exports = {
    names: deleteTulp.names,
    description: deleteTulp.description,
    args: true,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

            const userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send('I couldn\'t find that tulpa');
                return;
            }

            const tulpName = args.join(' ').trim();
            let newTulpArr = userData.tulps.filter(t => t.username !== tulpName);

            if (userData.tulps.length === newTulpArr.length) {
                msg.channel.send('I couldn\'t find that tulpa');
                return;
            }

            const updateDoc = {
                $set: {
                    tulps: newTulpArr
                }
            };

            await collection.updateOne(query, updateDoc, { upsert: false });

            msg.channel.send('Tulpa deleted!');
        }
        catch (error) {
            console.log(error);
        }
        finally {
            await client.close();
        }
    }
}