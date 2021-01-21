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

        let tulpName = args.join(' ').trim();

        const query = { id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection("users");

            const userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send(tulp.noDataWarning);
                return;
            }

            let existingTulp;

            let newTulpArr = userData.tulps.filter(t => {
                const isTulp = t.username === tulpName;
                if (isTulp) {
                    existingTulp = t;
                }
                return !isTulp;
            });

            if (userData.tulps.length === newTulpArr.length) {
                msg.channel.send('I couldn\'t find that tulpa');
                return;
            }

            existingTulp.avatar = imgLink;
            newTulpArr.push(existingTulp);

            const updateDoc = {
                $set: {
                    tulps: newTulpArr
                }
            };

            await collection.updateOne(query, updateDoc, { upsert: false });

            msg.channel.send('Avatar changed!');
        }
        catch (error) {
            console.log(error);
        }
        finally {
            await client.close();
        }
    }
}