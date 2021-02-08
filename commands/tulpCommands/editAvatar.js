const { editAvatar } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp
} = require('../../config.json');

module.exports = {
    names: editAvatar.names,
    description: editAvatar.description,
    args: true,
    guildOnly: false,
    usage: '<name> <new avatar <-- this must be sent as an image>',
    async execute(msg, args) {
        const imgLink = msg.attachments.map(img => img.url)[0];

        if (typeof imgLink === 'undefined') {
            msg.channel.send('I need a name and a profile picture');
            return;
        }

        const tulpName = args.join(' ').trim();

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

            let userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            let i = 0;
            const n = userData.tulps.length;

            while (i < n && userData.tulps[i].username !== tulpName) {
                i++;
            }

            if (i === n) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            userData.tulps[i].avatar = imgLink;

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