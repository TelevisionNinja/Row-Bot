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

        const query = { _id: msg.author.id };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            msg.channel.send(tulpConfig.notUserMsg);
            return;
        }

        let i = 0;
        let tulpArr = userData.tulps;
        const n = tulpArr.length;

        while (i < n && tulpArr[i].username !== username) {
            i++;
        }

        if (i === n) {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        let selectedTulp = tulpArr[i];

        if (selectedTulp.avatar === avatarLink) {
            msg.channel.send('Pleave provide a different profile picture to change to');
            return;
        }

        selectedTulp.avatar = avatarLink;
        tulpArr[i] = selectedTulp;

        const updateDoc = {
            $set: {
                tulps: tulpArr
            }
        };

        await tulpCollection.updateOne(query, updateDoc);

        msg.channel.send(editAvatar.confirmMsg);
    }
}