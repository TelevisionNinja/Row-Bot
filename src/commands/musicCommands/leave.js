import musicConfig from '../../../config/musicConfig.json' with { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { ApplicationCommandOptionType } from 'discord.js';

const leaveConfig = musicConfig.leave;

export default {
    interactionData: {
        name: leaveConfig.names[0],
        description: leaveConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: []
    },
    names: leaveConfig.names,
    description: leaveConfig.description,
    argsRequired: false,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '',
    execute(msg, args) {
        audioPlayer.leaveVC(msg);
    },
    executeInteraction(interaction) {
        audioPlayer.leaveVC(interaction);
    }
}
