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
    vcMemberOnly: false,
    usage: '<url> or <search term>',
    async execute(msg, args) {
        if (!msg.member.voice.channel) {
            msg.channel.send('Please join a voice channel to play music');
            return;
        }

        let songURL = '';
        let moreInfo = '';

        if (ytdl.validateURL(args[0])) {
            songURL = args[0];
        }
        else {
            const results = await ytSearch(args.join(' '));
            const videos = results.videos;

            if (videos.length) {
                songURL = videos[0].url;
                moreInfo = songURL;
            }
            else {
                msg.channel.send('No results');
                return;
            }
        }

        if (msg.guild.voice && msg.guild.voice.connection) {
            if (msg.guild.voice.channel.id !== msg.member.voice.channel.id) {
                msg.channel.send('Please join the voice channel the bot is already in to add songs to the queue');
                return;
            }
        }
        else {
            await msg.member.voice.channel.join();
        }

        const connection = msg.guild.voice.connection;

        playYoutube(msg, connection, songURL, moreInfo);
    }
}
