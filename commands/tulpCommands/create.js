import { default as tulpConfig } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { extractNameAndAvatar } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';
import { ApplicationCommandOptionTypes } from '../../lib/enums.js';
import { isValidURL } from '../../lib/stringUtils.js';

const create = tulpConfig.create,
    tagSeparator = config.tagSeparator;

export default {
    interactionData: {
        name: create.names[0],
        description: create.description,
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'avatar',
                description: 'The profile picture link',
                required: true,
                type: ApplicationCommandOptionTypes.STRING
            }
        ]
    },
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
    },
    async executeInteraction(interaction) {
        const avatarLink = interaction.options.get('avatar').value;

        if (!isValidURL(avatarLink)) {
            interaction.reply('Please provide a valid URL for the avatar');
            return;
        }

        const username = interaction.options.get('name').value;

        try {
            await tulps.set(interaction.user.id, username, avatarLink, `${username}:`, '');

            interaction.reply(create.confirmMsg);
        }
        catch (error) {
            interaction.reply(create.existingMsg);
        }
    }
}
