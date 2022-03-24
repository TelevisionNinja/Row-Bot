import tulpConfig from '../../../config/tulpConfig.json' assert { type: 'json' };
import config from '../../../config/config.json' assert { type: 'json' };
import { extractNameAndAvatar } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';
import { Constants } from 'discord.js';
import { isValidURL } from '../../lib/urlUtils.js';

const create = tulpConfig.create,
    tagSeparator = config.tagSeparator;

export default {
    interactionData: {
        name: create.names[0],
        description: create.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'avatar',
                description: 'The profile picture link',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
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
            msg.reply('Please provide a name and a profile picture');
            return;
        }

        if (!validURL) {
            msg.reply('Please provide a valid URL for the avatar');
            return;
        }

        try {
            await tulps.create(msg.author.id, username, avatarLink);

            msg.reply(create.confirmMsg);
        }
        catch (error) {
            msg.reply(create.existingMsg);
        }
    },
    async executeInteraction(interaction) {
        const avatarLink = interaction.options.getString('avatar');

        if (!isValidURL(avatarLink)) {
            interaction.reply('Please provide a valid URL for the avatar');
            return;
        }

        const username = interaction.options.getString('name');

        try {
            await tulps.create(interaction.user.id, username, avatarLink);

            interaction.reply(create.confirmMsg);
        }
        catch (error) {
            interaction.reply(create.existingMsg);
        }
    }
}