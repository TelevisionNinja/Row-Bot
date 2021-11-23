import tulpConfig from './tulpConfig.json' assert { type: 'json' };
import config from '../../config.json' assert { type: 'json' };
import { extractNameAndAvatar } from '../../lib/msgUtils.js';
import { tulps } from '../../lib/database.js';
import { Constants } from 'discord.js';
import { isValidURL } from '../../lib/urlUtils.js';

const editAvatar = tulpConfig.editAvatar,
    tulpConfigObj = config.tulp,
    tagSeparator = config.tagSeparator;

export default {
    interactionData: {
        name: editAvatar.names[0],
        description: editAvatar.description,
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
    },
    async executeInteraction(interaction) {
        const avatarLink = interaction.options.getString('avatar');

        if (!isValidURL(avatarLink)) {
            interaction.reply('Please provide a valid URL for the avatar');
            return;
        }

        const username = interaction.options.getString('name');
        const result = await tulps.updateAvatar(interaction.user.id, username, avatarLink);

        if (result.rowCount) {
            interaction.reply(editAvatar.confirmMsg);
        }
        else {
            interaction.reply(tulpConfigObj.noDataMsg);
        }
    }
}
