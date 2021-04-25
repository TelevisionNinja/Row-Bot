const { editName } = require('./tulpConfig.json');
const {
    tulp: tulpConfig,
    tagSeparator
} = require('../../config.json');
const { tulp: tulpCollection } = require('../../lib/database.js');

module.exports = {
    names: editName.names,
    description: editName.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new name>`,
    async execute(msg, args) {
        let namesArr = args.join(' ').split(tagSeparator).map(n => n.trim());
        const oldName = namesArr[0];
        let newName = '';
        let needParameters = false;

        if (namesArr.length === 1) {
            needParameters = true;
        }
        else {
            newName = namesArr[1];
        }

        if (needParameters || !oldName.length || !newName.length || oldName === newName) {
            msg.channel.send(`Please provide the current name and a new name spearated by a "${tagSeparator}"`);
            return;
        }

        //-----------------------------------------------------------
        // get user

        const userQuery = { _id: msg.author.id };
        const options = {
            projection: {
                tulps: {
                    $elemMatch: {
                        username: oldName
                    }
                }
            }
        }
        const userData = await tulpCollection.findOne(userQuery, options);

        if (userData === null) {
            msg.channel.send(tulpConfig.notUserMsg);
            return;
        }

        if (typeof userData.tulps === 'undefined') {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        //-----------------------------------------------------------
        // check for existing username

        const checkUsernameQuery = {
            _id: msg.author.id,
            'tulps.username': newName
        };
        const existingUsername = await tulpCollection.countDocuments(checkUsernameQuery, { limit: 1 });

        if (existingUsername) {
            msg.channel.send('That new name is already being used');
            return;
        }

        //-----------------------------------------------------------
        // set new brackets

        let selectedTulp = userData.tulps[0];
        const newStartBracket = `${newName}:`;
        const checkBracketsQuery = {
            _id: msg.author.id,
            'tulps.startBracket': newStartBracket,
            'tulps.endBracket': ''
        };
        const existingBrackets = await tulpCollection.countDocuments(checkBracketsQuery, { limit: 1 });

        if (!existingBrackets && !selectedTulp.endBracket.length && selectedTulp.startBracket === `${oldName}:`) {
            selectedTulp.startBracket = newStartBracket;
        }

        //-----------------------------------------------------------
        // update

        const updateQuery = {
            _id: msg.author.id,
            tulps: {
                $elemMatch: { username: oldName }
            }
        };
        const update = {
            $set: {
                'tulps.$.username': newName,
                'tulps.$.startBracket': selectedTulp.startBracket,
                'tulps.$.endBracket': selectedTulp.endBracket
            }
        };

        tulpCollection.updateOne(updateQuery, update);
        msg.channel.send(editName.confirmMsg);
    }
}