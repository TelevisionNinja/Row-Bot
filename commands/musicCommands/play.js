import { default as musicConfig } from './musicConfig.json';
import {
    playYoutube,
    joinVC
} from '../../lib/audio.js';
import { default as ytdl } from 'ytdl-core';
import { default as ytSearch } from 'yt-search';

const play = musicConfig.play;

export default {
    names: play.names,
    description: play.description,
    argsRequired: true,
    argsOptional: false,
    vcMemberOnly: false,
    usage: '<url> or <search term>',
    async execute(msg, args) {
        if (!joinVC(msg)) {
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

        playYoutube(msg, songURL, moreInfo);
    }
}
