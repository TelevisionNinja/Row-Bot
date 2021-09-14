import { default as musicConfig } from './musicConfig.json';
import { default as audio } from '../../lib/audio.js';
import { default as ytdl } from 'ytdl-core';
import { default as ytSearch } from 'yt-search';
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
        if (!audio.joinVC(msg)) {
            return;
        }

        if (ytdl.validateURL(args[0])) {
            audio.playYoutube(msg, args[0]);
        }
        else {
            const results = await ytSearch(args.join(' '));
            const videos = results.videos;

            if (videos.length) {
                const songURL = videos[0].url;

                audio.playYoutube(msg, songURL, songURL);
            }
            else {
                msg.channel.send('No results');
            }
        }
    },
    async executeInteraction(interaction) {
        if (!audio.joinVCInteraction(interaction)) {
            return;
        }

        const arg = interaction.options.getString('song');

        if (ytdl.validateURL(arg)) {
            interaction.reply('Fetching song');
            audio.playYoutube(interaction, arg);
        }
        else {
            await interaction.deferReply();

            const results = await ytSearch(arg);
            const videos = results.videos;

            if (videos.length) {
                const songURL = videos[0].url;

                interaction.editReply('Song found');
                audio.playYoutube(interaction, songURL, songURL);
            }
            else {
                interaction.editReply('No results');
            }
        }
    }
}
