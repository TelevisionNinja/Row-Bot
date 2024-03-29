import { default as audioUtils } from './audioUtils.js';
import { default as audioQueue } from './audioQueue.js';
import { cutOff } from './stringUtils.js';
import { default as ytSearch } from 'yt-search';
import { isValidURL } from './urlUtils.js';
import PQueue from 'p-queue';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 100
});

function isPlaylistURL(url) {
    url = url.toLowerCase();
    return url.startsWith('https://www.youtube.com/playlist?list=') || url.startsWith('http://www.youtube.com/playlist?list=');
}

export default {
    /**
     * clear the queue of a guild
     * 
     * @param {*} msg 
     */
    clearQueue(msg) {
        audioQueue.clear(msg.guild.id);
        msg.reply('Queue cleared');
    },

    /**
     * makes the bot leave the vc, deletes the guild's audio player, and deletes the guild's queue
     * 
     * @param {*} msg 
     */
    leaveVC(msg) {
        audioUtils.leaveVC(msg.guild.id);
        msg.reply('Okie dokie lokie!');
    },

    /**
     * pause an audio player of a guild
     * 
     * @param {*} msg 
     */
    pause(msg) {
        audioUtils.pause(msg.guild.id);
        msg.reply('Song paused');
    },

    /**
     * play a youtube/soundcloud link or a search query
     * 
     * @param {*} msg 
     * @param {*} song link or search query
     */
    async play(msg, song) {
        if (!audioUtils.joinVC(msg)) {
            return;
        }

        if (isValidURL(song) && !isPlaylistURL(song)) {
            const isCurrentSong = audioUtils.queueASong(msg, song);

            if (isCurrentSong) {
                msg.reply('Fetching song...');
            }
        }
        else {
            const results = queue.add(() => ytSearch(song));
            const reply = await msg.reply({
                content: 'Fetching result...',
                fetchReply: true
            });
            const searchResult = (await results).all[0];

            if (typeof searchResult === 'undefined') {
                reply.reply('No results');
                return;
            }

            switch (searchResult.type) {
                case 'list':
                    const playlist = await queue.add(() => ytSearch({ listId: searchResult.listId }));
                    playlist.videos.forEach(video => audioUtils.queueASong(reply, `https://youtu.be/${video.videoId}`, false));
                    break;
                case 'video':
                    const songURL = searchResult.url;
                    audioUtils.queueASong(reply, songURL);
                    break;
                default:
                    reply.reply('No results');
            }
        }
    },

    /**
     * get the queue of a guild
     * 
     * @param {*} msg 
     */
    getQueue(msg) {
        const queue = audioQueue.get(msg.guild.id);

        if (queue.length) {
            const currentSongURL = queue[0];
            let queueStr = `Current song:\n${currentSongURL}`;

            if (queue.length > 1) {
                let queueList = '\nQueue:';

                for (let i = 1; i < queue.length; i++) {
                    queueList = `${queueList}\n${i}. ${queue[i]}`;
                }

                queueStr = `${queueStr}${queueList}`;
            }

            msg.reply(cutOff(queueStr));
        }
        else {
            msg.reply('There are no songs in the queue');
        }
    },

    /**
     * removes a song at an index in the queue
     * 
     * @param {*} msg 
     * @param {*} index index of certain song to remove
     */
    removeSong(msg, index) {
        if (!index) {
            msg.reply('You can\'t remove the current song');
            return;
        }

        if (index < 0) {
            msg.reply('No negative numbers!');
            return;
        }

        const guildID = msg.guild.id;
        const queue = audioQueue.get(guildID);

        if (!queue.length || queue.length === 1) {
            msg.reply('No songs to remove');
            return;
        }

        if (index >= queue.length) {
            msg.reply('No numbers bigger than the queue size!');
            return;
        }

        msg.reply(`Song removed: ${queue[index]}`);
        audioQueue.popIndex(guildID, index);
    },

    /**
     * resume an audio player of a guild
     * 
     * @param {*} msg 
     */
    resume(msg) {
        audioUtils.resume(msg);
        msg.reply('Song resumed');
    },

    /**
     * skips the current song or skips to an index in the queue
     * 
     * @param {*} msg 
     * @param {*} index index of a certain song skip to
     */
    skip(msg, index = 0) {
        audioUtils.skip(msg, index);
    }
}
