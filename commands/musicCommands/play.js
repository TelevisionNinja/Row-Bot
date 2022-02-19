import musicConfig from './musicConfig.json' assert { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { Constants } from 'discord.js';

const play = musicConfig.play;

export default {
    interactionData: {
        name: play.names[0],
        description: play.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'song',
                description: 'The URL or search term',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: play.names,
    description: play.description,
    argsRequired: true,
    argsOptional: false,
    vcMemberOnly: false,
    usage: '<url> or <search term>',
    async execute(msg, args) {
        audioPlayer.play(msg, args.join(' '));
    },
    async executeInteraction(interaction) {
        const song = interaction.options.getString('song');

        audioPlayer.play(interaction, song);
    }
}
