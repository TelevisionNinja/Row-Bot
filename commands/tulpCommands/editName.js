const { editName } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp
} = require('../../config.json');

module.exports = {
    names: editName.names,
    description: editName.description,
    args: true,
    guildOnly: false,
    usage: '<name>, <new name>',
    async execute(msg, args) {
        const namesArr = args.join(' ').split(',').map(name => name.trim());

        if (namesArr.length === 1) {
            msg.channel.send('Please provide the old name and the new name spearated by a comma');
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
                msg.channel.send(tulp.noDataWarning);
                return;
            }

            const newName = namesArr[1];
            let existingTulp;

            let newTulpArr = userData.tulps.filter(t => {
                const isTulp = t.username === namesArr[0];
                if (isTulp) {
                    existingTulp = t;
                }
                return !isTulp;
            });

            if (userData.tulps.length === newTulpArr.length) {
                msg.channel.send('I couldn\'t find that tulpa');
                return;
            }

            existingTulp.username = newName;
            newTulpArr.push(existingTulp);

            const updateDoc = {
                $set: {
                    tulps: newTulpArr
                }
            };

            await collection.updateOne(query, updateDoc, { upsert: false });

            msg.channel.send('Name changed!');
        }
        catch (error) {
            console.log(error);
        }
        finally {
            await client.close();
        }
    }
}