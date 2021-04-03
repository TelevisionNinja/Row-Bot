const { editBrackets } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp,
    tagSeparator
} = require('../../config.json');

module.exports = {
    names: editBrackets.names,
    description: editBrackets.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new_bracket>text<new_bracket>`,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator).map(s => s.trim());

        const errorMessage = `Please provide a name followed by a "${tagSeparator}" and then the new brackets enclosing the word "text". "${tagSeparator}" are not allow in brackets`;

        if (args.length < 2) {
            msg.channel.send(errorMessage);
            return;
        }

        const name = args[0];
        const unparsedBrackets = args[1];

        if (unparsedBrackets.indexOf('text') === -1) {
            msg.channel.send(errorMessage);
            return;
        }

        const bracketArr = unparsedBrackets.split('text');

        if (!bracketArr.length) {
            msg.channel.send(errorMessage);
            return;
        }

        const startBracket = bracketArr[0];
        let endBracket = '';

        if (bracketArr.length > 1) {
            endBracket = bracketArr[1];
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
            let selectedTulp = undefined;

            for (let j = 0, n = userData.tulps.length; j < n; j++) {
                const currentTulp = userData.tulps[j];

                // check for existing brackets
                if (currentTulp.startBracket === startBracket && currentTulp.endBracket === endBracket) {
                    msg.channel.send('These brackets are already being used');
                    return;
                }

                // find tulp
                if (currentTulp.username === name) {
                    selectedTulp = currentTulp;
                    i = j;
                }
            }

            if (typeof selectedTulp === 'undefined') {
                msg.channel.send(tulp.noDataMsg);
                return;
            }

            selectedTulp.startBracket = startBracket;
            selectedTulp.endBracket = endBracket;
            userData.tulps[i] = selectedTulp;

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

        msg.channel.send(editBrackets.confirmMsg);
    }
}