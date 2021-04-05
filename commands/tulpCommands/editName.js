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
        let namesArr = args.join(' ').split(tagSeparator).map(n => n.trim());
        const name = namesArr[0];
        let newName = '';
        let needParameters = false;

        if (namesArr.length === 1) {
            needParameters = true;
        }
        else {
            newName = namesArr[1];
        }

        if (needParameters || !name.length || !newName.length) {
            msg.channel.send(`Please provide the old name and the new name spearated by a "${tagSeparator}"`);
            return;
        }

        if (name === newName) {
            msg.channel.send('Please provide a different name to change to');
            return;
        }

        const query = { _id: msg.author.id };

        const client = new MongoClient(mongodbURI, { useUnifiedTopology: true });

        try {
            await client.connect();

            const database = client.db('tulps');
            const collection = database.collection('users');

            const userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send(tulp.notUserMsg);
                return;
            }

            let i = 0;
            let tulpArr = userData.tulps;
            const n = tulpArr.length;

            while (i < n && tulpArr[i].username !== newName) {
                i++;
            }

            if (i !== n) {
                msg.channel.send('That new name is already being used');
                return;
            }

            i = 0;

            while (i < n && tulpArr[i].username !== name) {
                i++;
            }

            if (i === n) {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            const selectedTulp = tulpArr[i];

            if (!selectedTulp.endBracket.length && selectedTulp.startBracket.substring(0, selectedTulp.startBracket.length - 1) === name) {
                selectedTulp.startBracket = `${newName}:`;
            }

            selectedTulp.username = newName;
            tulpArr[i] = selectedTulp;

            const updateDoc = {
                $set: {
                    tulps: tulpArr
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