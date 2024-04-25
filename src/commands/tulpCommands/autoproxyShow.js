import tulpConfig from '../../../config/tulpConfig.json' with { type: 'json' };
import { autoProxy } from '../../lib/database.js';
import { ApplicationCommandOptionType } from 'discord.js';

const commandConfig = tulpConfig.autoproxyShow;

export default {
    interactionData: {
        name: commandConfig.names[0],
        description: commandConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: []
    },
    names: commandConfig.names,
    description: commandConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const result = await autoProxy.get(msg.author.id);

        if (result) {
            msg.reply(`${result.username} is set for autoproxy`);
        }
        else {
            msg.reply(commandConfig.noResultMsg);
        }
    },
    async executeInteraction(interaction) {
        const result = await autoProxy.get(interaction.user.id);

        if (result) {
            interaction.reply(`${result.username} is set for autoproxy`);
        }
        else {
            interaction.reply(commandConfig.noResultMsg);
        }
    }
}
