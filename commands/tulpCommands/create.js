const { create } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tagSeparator
} = require('../../config.json');
const msgUtils = require('../../lib/msgUtils.js');

module.exports = {
    names: create.names,
    description: create.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <image link or image upload>`,
    async execute(msg, args) {
        const {
            success,
            validURL,
            username,
            avatarLink
        } = msgUtils.extractNameAndAvatar(msg, args);

        if (!success) {
            msg.channel.send('Pleave provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.channel.send('Pleave provide a valid URL for the avatar');
            return;
        }

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
                            username: username,
                            avatar: avatarLink
                        }
                    ]
                };

                await collection.insertOne(tulp);
                msg.channel.send(create.confirmMsg);
                return;
            }

            const existingTulp = userData.tulps.find(t => t.username === username);

            if (typeof existingTulp === 'undefined') {
                userData.tulps.push({
                    username: username,
                    avatar: avatarLink
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