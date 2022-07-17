import tulpConfig from '../../../config/tulpConfig.json' assert { type: 'json' };
import config from '../../../config/config.json' assert { type: 'json' };
import { tulps } from '../../lib/database.js';
import { ApplicationCommandOptionType } from 'discord.js';

const deleteTulp = tulpConfig.deleteTulp,
    tulpConfigObj = config.tulp;

export default {
    interactionData: {
        name: deleteTulp.names[0],
        description: deleteTulp.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: ApplicationCommandOptionType.String
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
