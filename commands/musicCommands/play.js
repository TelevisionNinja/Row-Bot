import { default as musicConfig } from './musicConfig.json';
import { playYoutube } from '../../lib/audio.js';
import { default as ytdl } from 'ytdl-core';
import { default as ytSearch } from 'yt-search';

const play = musicConfig.play;

export default {
    names: play.names,
    description: play.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<url> or <search term>',
    async execute(msg, args) {
        let songURL = '';

        if (ytdl.validateURL(args[0])) {
            songURL = args[0];
        }
        else {
            const results = await ytSearch(args.join(' '));
            const videos = results.videos;

            if (videos.length) {
                songURL = videos[0].url;
            }
            else {
                msg.channel.send('No results');
                return;
            }
        }

        if (!(msg.guild.voice && msg.guild.voice.connection)) {
            await msg.member.voice.channel.join();
        }

        const connection = msg.guild.voice.connection;

        playYoutube(msg, connection, songURL);
    }
}
