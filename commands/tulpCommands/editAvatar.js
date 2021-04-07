const { editAvatar } = require('./tulpConfig.json');
const {
    tulp: tulpConfig,
    tagSeparator
} = require('../../config.json');
const msgUtils = require('../../lib/msgUtils.js');
const { tulp: tulpCollection } = require('../../lib/database.js');

module.exports = {
    names: editAvatar.names,
    description: editAvatar.description,
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

        const query = {
            _id: msg.author.id,
            'tulps.username': username
        };
        const update = {
            $set: {
                'tulps.$.avatar': avatarLink
            }
        };
        const result = await tulpCollection.updateOne(query, update);

        if (result.result.n) {
            msg.channel.send(editAvatar.confirmMsg);
        }
        else {
            msg.channel.send(tulpConfig.noDataMsg);
        }
    }
}