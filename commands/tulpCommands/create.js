import { default as tulpConfig } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { extractNameAndAvatar } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';

const create = tulpConfig.create,
    tagSeparator = config.tagSeparator;

export default {
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
        } = extractNameAndAvatar(msg, args);

        if (!success) {
            msg.channel.send('Please provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.channel.send('Please provide a valid URL for the avatar');
            return;
        }

        try {
            await tulps.set(msg.author.id, username, avatarLink, `${username}:`, '');

            msg.channel.send(create.confirmMsg);
        }
        catch (error) {
            msg.channel.send(create.existingMsg);
        }
    }
}