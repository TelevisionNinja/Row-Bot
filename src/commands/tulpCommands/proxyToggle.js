import tulpConfig from '../../../config/tulpConfig.json' assert { type: 'json' };
import { proxy } from '../../lib/database.js';
import { ApplicationCommandOptionType } from 'discord.js';

const commandConfig = tulpConfig.proxyToggle;

export default {
    interactionData: {
        name: commandConfig.names[0],
        description: commandConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'mode',
                description: 'Turn on or off tulp proxying',
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

        if (mode) {
            try {
                await proxy.on(msg.author.id);
                msg.reply('Proxying enabled');
            }
            catch (error) {
                msg.reply('Proxying is already enabled');
            }
        }
        else {
            proxy.off(msg.author.id);
            msg.reply('Proxying disabled');
        }
    },
    async executeInteraction(interaction) {
        const mode = interaction.options.getBoolean('mode');

        if (mode) {
            try {
                await proxy.on(interaction.user.id);
                interaction.reply('Proxying enabled');
            }
            catch (error) {
                interaction.reply('Proxying is already enabled');
            }
        }
        else {
            proxy.off(interaction.user.id);
            interaction.reply('Proxying disabled');
        }
    }
}
