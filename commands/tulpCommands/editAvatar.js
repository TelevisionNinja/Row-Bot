import { default as tulpConfig } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { extractNameAndAvatar } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';

const editAvatar = tulpConfig.editAvatar,
    tulpConfigObj = config.tulp,
    tagSeparator = config.tagSeparator;

export default {
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
        } = extractNameAndAvatar(msg, args);

        if (!success) {
            msg.channel.send('Please provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.channel.send('Please provide a valid URL for the avatar');
            return;
        }

        const result = await tulps.updateAvatar(msg.author.id, username, avatarLink);

        if (result.rowCount) {
            msg.channel.send(editAvatar.confirmMsg);
        }
        else {
            msg.channel.send(tulpConfigObj.noDataMsg);
        }
    }
}