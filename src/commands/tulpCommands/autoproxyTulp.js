import tulpConfig from '../../../config/tulpConfig.json' with { type: 'json' };
import config from '../../../config/config.json' with { type: 'json' };
import { autoProxy } from '../../lib/database.js';
import { ApplicationCommandOptionType } from 'discord.js';

const commandConfig = tulpConfig.autoproxyTulp,
    tulpConfigObj = config.tulp;

export default {
    interactionData: {
        name: commandConfig.names[0],
        description: commandConfig.description,
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
    names: commandConfig.names,
    description: commandConfig.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const username = args.join(' ').trimStart();

        try {
            await autoProxy.updateTulp(msg.author.id, username);
            msg.reply(commandConfig.confirmMsg);
        }
        catch (error) {
            msg.reply(tulpConfigObj.noDataMsg);
        }
    },
    async executeInteraction(interaction) {
        const username = interaction.options.getString('name');

        try {
            await autoProxy.updateTulp(interaction.user.id, username);
            interaction.reply(commandConfig.confirmMsg);
        }
        catch (error) {
            interaction.reply(tulpConfigObj.noDataMsg);
        }
    }
}
