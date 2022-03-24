import { default as audio } from './audioUtils.js';
import { default as audioQueue } from './audioQueue.js';
import { cutOff } from './stringUtils.js';
import { default as ytdl } from 'ytdl-core';
import { default as ytSearch } from 'yt-search';
import { Constants }from 'discord.js';

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
        audio.leaveVC(msg.guild.id);
        msg.reply('Okie dokie lokie!');
    },

    /**
     * pause an audio player of a guild
     * 
     * @param {*} msg 
     */
    pause(msg) {
        audio.pause(msg.guild.id);
        msg.reply('Song paused');
    },

    /**
     * play a youtube link or a search query
     * 
     * @param {*} msg 
     * @param {*} song link or search query
     */
    async play(msg, song) {
        if (!audio.joinVC(msg)) {
            return;
        }

        if (ytdl.validateURL(song)) {
            msg.reply('Fetching song...');
            audio.playYoutube(msg, song);
        }
        else {
            const isInteraction = msg.type === Constants.InteractionTypes.APPLICATION_COMMAND;

            if (isInteraction) {
                await msg.deferReply();
            }

            const results = await ytSearch(song);
            const videos = results.videos;

            if (videos.length) {
                const songURL = videos[0].url;

                if (isInteraction) {
                    msg.editReply('Fetching song...');
                }
                else {
                    msg.reply('Fetching song...');
                }

                audio.playYoutube(msg, songURL, songURL);
            }
            else {
                msg.reply('No results');
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
            const playing = queue[0];
            let queueStr = `Currently playing:\n${playing}`;

            if (queue.length > 1) {
                let queueList = '\nQueue:';

                for (let i = 1; i < queue.length; i++) {
                    queueList = `${queueList}\n${i}. ${queue[i]}`;
                }

                queueStr = `${queueStr}${queueList}`;
            }

            msg.reply(cutOff(queueStr, 2000));
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
        audio.resume(msg.guild.id);
        msg.reply('Song resumed');
    },

    /**
     * skips the current song or skips to an index in the queue
     * 
     * @param {*} msg 
     * @param {*} index index of a certain song skip to
     */
    skip(msg, index = 0) {
        audio.skip(msg, index);
    }
}