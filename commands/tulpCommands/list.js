import { default as tulpConfig } from './tulpConfig.json';
import { tulps } from '../../lib/database.js';
import { ApplicationCommandOptionTypes } from '../../lib/enums.js';

const listConfig = tulpConfig.list;

export default {
    interactionData: {
        name: listConfig.names[0],
        description: listConfig.description,
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: listConfig.names,
    description: listConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const tulpNames = await tulps.listAll(msg.author.id);

        if (tulpNames.length) {
            msg.channel.send({
                embeds: [{
                    title: 'Your tulps',
                    description: tulpNames.map(t => `• ${t.username}`).join('\n')
                }]
            });
        }
        else {
            msg.channel.send(listConfig.noTulpsMsg);
        }
    },
    async executeInteraction(interaction) {
        const tulpNames = await tulps.listAll(interaction.user.id);

        if (tulpNames.length) {
            interaction.reply({
                embeds: [{
                    title: 'Your tulps',
                    description: tulpNames.map(t => `• ${t.username}`).join('\n')
                }]
            });
        }
        else {
            interaction.reply(listConfig.noTulpsMsg);
        }
    }
}
