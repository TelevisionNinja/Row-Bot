const { create } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const { mongodbURI } = require('../../config.json');

module.exports = {
    names: create.names,
    description: create.description,
    args: true,
    guildOnly: false,
    usage: '<name> <avatar <-- this must be sent as an image>',
    async execute(msg, args) {
        const imgLink = msg.attachments.map(img => img.url)[0];

        if (typeof imgLink === 'undefined') {
            msg.channel.send('I need a name and a profile picture');
            return;
        }

        const tulpName = args.join(' ').split(',')[0].trim();

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

            const userData = await collection.findOne(query);

            if (userData === null) {
                const tulp = {
                    id: msg.author.id,
                    tulps: [
                        {
                            username: tulpName,
                            avatar: imgLink
                        }
                    ]
                };

                await collection.insertOne(tulp);
                msg.channel.send(create.confirmMsg);
                return;
            }

            const existingTulp = userData.tulps.find(t => t.username === tulpName);

            if (typeof existingTulp === 'undefined') {
                userData.tulps.push({
                    username: tulpName,
                    avatar: imgLink
                });

                const updateDoc = {
                    $set: {
                        tulps: userData.tulps
                    }
                };

                await collection.updateOne(query, updateDoc, { upsert: false });
                msg.channel.send(create.confirmMsg);
                return;
            }
        }
        catch (error) {
            console.log(error);
            return;
        }
        finally {
            await client.close();
        }

        msg.channel.send(create.existingMsg);
    }
}