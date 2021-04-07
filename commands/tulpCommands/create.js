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

        const checkQuery = { _id: msg.author.id };
        const isUser = await tulpCollection.countDocuments(checkQuery, { limit: 1 });

        if (isUser) {
            const updateQuery = {
                _id: msg.author.id,
                'tulps.username': { $ne: username },
            };
            const update = {
                $push: {
                    tulps: {
                        username: username,
                        avatar: avatarLink,
                        startBracket: `${username}:`,
                        endBracket: ''
                    }
                }
            };
            const result = await tulpCollection.updateOne(updateQuery, update);

            if (result.result.n) {
                msg.channel.send(create.confirmMsg);
            }
            else {
                msg.channel.send(create.existingMsg);
            }
        }
        else {
            const newUser = {
                _id: msg.author.id,
                tulps: [{
                    username: username,
                    avatar: avatarLink,
                    startBracket: `${username}:`,
                    endBracket: ''
                }]
            };

            await tulpCollection.insertOne(newUser);
            msg.channel.send(create.confirmMsg);
        }
    }
}