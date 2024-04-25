import musicConfig from '../../../config/musicConfig.json' with { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { ApplicationCommandOptionType } from 'discord.js';

const play = musicConfig.play;

export default {
    interactionData: {
        name: play.names[0],
        description: play.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'song',
                description: 'The song/playlist URL or search term',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: play.names,
    description: play.description,
    argsRequired: true,
    argsOptional: false,
    vcMemberOnly: false,
    usage: '<song/playlist url> or <search term>',
    async execute(msg, args) {
        audioPlayer.play(msg, args.join(' '));
    },
    async executeInteraction(interaction) {
        const song = interaction.options.getString('song');

        audioPlayer.play(interaction, song);
    }
}
