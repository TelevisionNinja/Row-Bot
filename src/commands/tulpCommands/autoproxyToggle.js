import tulpConfig from '../../../config/tulpConfig.json' assert { type: 'json' };
import { autoProxy } from '../../lib/database.js';
import { ApplicationCommandOptionType } from 'discord.js';

const commandConfig = tulpConfig.autoproxyToggle;

export default {
    interactionData: {
        name: commandConfig.names[0],
        description: commandConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'mode',
                description: 'The mode of the autoproxy',
                required: true,
                type: ApplicationCommandOptionType.Boolean
            }
        ]
    },
    names: commandConfig.names,
    description: commandConfig.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '\'on\' or \'off\'',
    async execute(msg, args) {
        const proxyMode = args[0];
        let mode = false;

        if (proxyMode === 'on') {
            mode = true;
        }
        else if (proxyMode !== 'off') {
            msg.reply('Set the mode to \'on\' or \'off\'');
            return;
        }

        const result = await autoProxy.updateMode(msg.author.id, mode);

        if (result.rowCount) {
            if (mode) {
                msg.reply('Autoproxy on');
            }
            else {
                msg.reply('Autoproxy off');
            }
        }
        else {
            msg.reply(commandConfig.errorMsg);
        }
    },
    async executeInteraction(interaction) {
        const mode = interaction.options.getBoolean('mode');
        const result = await autoProxy.updateMode(interaction.user.id, mode);

        if (result.rowCount) {
            if (mode) {
                interaction.reply('Autoproxy on');
            }
            else {
                interaction.reply('Autoproxy off');
            }
        }
        else {
            interaction.reply(commandConfig.errorMsg);
        }
    }
}
