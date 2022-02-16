import tulpConfig from './tulpConfig.json' assert { type: 'json' };
import config from '../../config.json' assert { type: 'json' };
import { tulps } from '../../lib/database.js';
import { Constants } from 'discord.js';

const deleteTulp = tulpConfig.deleteTulp,
    tulpConfigObj = config.tulp;

export default {
    interactionData: {
        name: deleteTulp.names[0],
        description: deleteTulp.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: deleteTulp.names,
    description: deleteTulp.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const username = args.join(' ').trimStart();
        const result = await tulps.delete(msg.author.id, username);

        if (result.rowCount) {
            msg.reply(deleteTulp.confirmMsg);
        }
        else {
            msg.reply(tulpConfigObj.noDataMsg);
        }
    },
    async executeInteraction(interaction) {
        const username = interaction.options.getString('name');
        const result = await tulps.delete(interaction.user.id, username);

        if (result.rowCount) {
            interaction.reply(deleteTulp.confirmMsg);
        }
        else {
            interaction.reply(tulpConfigObj.noDataMsg);
        }
    }
}
