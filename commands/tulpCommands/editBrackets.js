const { editBrackets } = require('./tulpConfig.json');
const { MongoClient } = require('mongodb');
const {
    mongodbURI,
    tulp,
    tagSeparator
} = require('../../config.json');

const enclosingText = 'text';

module.exports = {
    names: editBrackets.names,
    description: editBrackets.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new_bracket>${enclosingText}<new_bracket>`,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator).map(s => s.trim());

        const errorMessage = `Please provide a name followed by a "${tagSeparator}" and then the new brackets enclosing the word "${enclosingText}". "${tagSeparator}" are not allowed in brackets`;

        if (args.length < 2) {
            msg.channel.send(errorMessage);
            return;
        }

        const name = args[0];
        const unparsedBrackets = args[1];

        if (unparsedBrackets.indexOf(enclosingText) === -1) {
            msg.channel.send(errorMessage);
            return;
        }

        const bracketArr = unparsedBrackets.split(enclosingText).map(b => b.trim());

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

            const userData = await collection.findOne(query);

            if (userData === null) {
                msg.channel.send(tulp.notUserMsg);
                return;
            }

            let i = 0;
            let selectedTulp = undefined;
            let tulpArr = userData.tulps;

            for (let j = 0, n = tulpArr.length; j < n; j++) {
                const currentTulp = tulpArr[j];

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

        msg.channel.send(editBrackets.confirmMsg);
    }
}