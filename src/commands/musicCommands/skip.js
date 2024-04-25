import musicConfig from '../../../config/musicConfig.json' with { type: 'json' };
import { default as audioPlayer } from '../../lib/audioPlayer.js';
import { ApplicationCommandOptionType } from 'discord.js';

const skipConfig = musicConfig.skip;

export default {
    interactionData: {
        name: skipConfig.names[0],
        description: skipConfig.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'index',
                description: 'The index of the song to skip to',
                required: false,
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    names: skipConfig.names,
    description: skipConfig.description,
    argsRequired: false,
    argsOptional: true,
    vcMemberOnly: true,
    usage: '<index>',
    execute(msg, args) {
        if (args.length) {
            const index = parseInt(args[0], 10);

            if (isNaN(index)) {
                msg.reply('Please provide a number');
                return;
            }

            audioPlayer.skip(msg, index);
        }
        else {
            audioPlayer.skip(msg);
        }
    },
    executeInteraction(interaction) {
        let index = interaction.options.getInteger('index');

        // optional args will be null if they are not included by the user
        if (index === null) {
            index = 0;
        }
        else {
            index = parseInt(index, 10);
        }

        audioPlayer.skip(interaction, index);
    }
}
