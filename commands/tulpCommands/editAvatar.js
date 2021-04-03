const { editAvatar } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp,
    tagSeparator
} = require('../../config.json');
const msgUtils = require('../../lib/msgUtils.js');

module.exports = {
    names: editAvatar.names,
    description: editAvatar.description,
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
            msg.channel.send('Please provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.channel.send('Please provide a valid URL for the avatar');
            return;
        }

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection('users');

            let userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            let i = 0;
            const n = userData.tulps.length;

            while (i < n && userData.tulps[i].username !== username) {
                i++;
            }

            if (i === n) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            if (userData.tulps[i].avatar === avatarLink) {
                msg.channel.send('Pleave provide a different profile picture to change to');
                return;
            }

            userData.tulps[i].avatar = avatarLink;

            const updateDoc = {
                $set: {
                    tulps: userData.tulps
                }
            };

            await collection.updateOne(query, updateDoc, { upsert: false });
        }
        catch (error) {
            console.log(error);
            return;
        }
        finally {
            await client.close();
        }

        msg.channel.send(editAvatar.confirmMsg);
    }
}