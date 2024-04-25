import musicConfig from '../../../config/musicConfig.json' with { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { ApplicationCommandOptionType } from 'discord.js';

const removeConfig = musicConfig.remove;

export default {
    interactionData: {
        name: removeConfig.names[0],
        description: removeConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'index',
                description: 'The index of the song to remove',
                required: true,
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    names: removeConfig.names,
    description: removeConfig.description,
    argsRequired: true,
    argsOptional: false,
    vcMemberOnly: true,
    usage: '<index>',
    execute(msg, args) {
        const index = parseInt(args[0], 10);

        if (isNaN(index)) {
            msg.reply('Please provide a number');
        }
        else {
            audioPlayer.removeSong(msg, index);
        }
    },
    executeInteraction(interaction) {
        const index = parseInt(interaction.options.getInteger('index'), 10);

        audioPlayer.removeSong(interaction, index);
    }
}
