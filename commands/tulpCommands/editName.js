const { editName } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp,
    tagSeparator
} = require('../../config.json');

module.exports = {
    names: editName.names,
    description: editName.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new name>`,
    async execute(msg, args) {
        let namesArr = args.join(' ').split(tagSeparator);
        namesArr[0] = namesArr[0].trim();

        let needParameters = false;
        const namesArrLen = namesArr.length;

        if (namesArrLen === 1) {
            needParameters = true;
        }
        else {
            namesArr[1] = namesArr[1].trim();
        }

        if (!needParameters && (!namesArr[0].length || !namesArr[1].length)) {
            needParameters = true;
        }

        if (needParameters) {
            msg.channel.send(`Please provide the old name and the new name spearated by a "${tagSeparator}"`);
            return;
        }

        if (namesArr[0] === namesArr[1]) {
            msg.channel.send('Please provide a different name to change to');
            return;
        }

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

            while (i < n && userData.tulps[i].username !== namesArr[0]) {
                i++;
            }

            if (i === n) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            userData.tulps[i].username = namesArr[1];

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

        msg.channel.send(editName.confirmMsg);
    }
}