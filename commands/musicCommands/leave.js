import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';
import { ApplicationCommandOptionTypes } from '../../lib/enums.js';

const leaveConfig = musicConfig.leave;

export default {
    interactionData: {
        name: leaveConfig.names[0],
        description: leaveConfig.description,
        type: ApplicationCommandOptionTypes.SUB_COMMAND,
        options: []
    },
    names: leaveConfig.names,
    description: leaveConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audio.leave(msg.guild.id);
    },
    executeInteraction(interaction) {
        audio.leave(interaction.guild.id);
        interaction.reply('Okie dokie lokie!');
    }
}
