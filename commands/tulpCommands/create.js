const { create } = require('./tulpConfig.json');
const { tagSeparator } = require('../../config.json');
const msgUtils = require('../../lib/msgUtils.js');
const { tulp: tulpCollection } = require('../../lib/database.js');

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
            msg.channel.send('Please provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.channel.send('Please provide a valid URL for the avatar');
            return;
        }

        const query = { _id: msg.author.id };
        const newTulp = {
            username: username,
            avatar: avatarLink,
            startBracket: `${username}:`,
            endBracket: ''
        };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            const user = {
                _id: msg.author.id,
                tulps: [newTulp]
            };

            await tulpCollection.insertOne(user);
            msg.channel.send(create.confirmMsg);
            return;
        }

        const existingTulp = userData.tulps.find(t => t.username === username);

        if (typeof existingTulp === 'undefined') {
            userData.tulps.push(newTulp);

            const updateDoc = {
                $set: {
                    tulps: userData.tulps
                }
            };

            await tulpCollection.updateOne(query, updateDoc, { upsert: false });
            msg.channel.send(create.confirmMsg);
        }
        else {
            msg.channel.send(create.existingMsg);
        }
    }
}