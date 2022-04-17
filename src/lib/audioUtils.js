import { default as ytdl } from 'ytdl-core';
import { Readable } from 'stream';
import { default as audioQueue } from './audioQueue.js';
import {
    createAudioPlayer,
    joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    AudioPlayerStatus
} from '@discordjs/voice';
import { createReadStream } from 'fs';
import { resolve } from 'path';

let players = new Map();

export default {
    playYoutube,
    playStream,
    playFile,
    pause,
    resume,
    skip,
    vcCheck,
    joinVC,
    leaveVC
}

/**
 * play a youtube link
 * 
 * @param {*} msg 
 * @param {*} url 
 * @param {*} moreInfo 
 * @returns 
 */
async function playYoutube(msg, url, moreInfo = '') {
    const id = msg.guild.id;

    audioQueue.push(id, url);

    if (audioQueue.get(id).length > 1) {
        msg.channel.send('Added to the queue');
        return;
    }

    //--------------------------------------

    try {
        const ytStream = ytdl(url, {
            filter: 'audioonly'
        });
        const info = ytdl.getInfo(url);

        //--------------------------------------

        let arr = [];

        ytStream.on('data', d => arr.push(d));

        //--------------------------------------

        ytStream.on('end', async () => {
            let title = (await info).videoDetails.title;

            if (moreInfo.length) {
                title = `${title}\n${moreInfo}`;
            }

            playStream(msg, Readable.from(arr), title);
        });
    }
    catch (error) {
        msg.channel.send(error.toString());
    }
}

/**
 * gets a readable stream from a youtube link and then plays the stream
 * 
 * @param {*} msg 
 * @param {*} url 
 */
async function youtubeToStream(msg, url) {
    try {
        const ytStream = ytdl(url, {
            filter: 'audioonly'
        });
        const info = ytdl.getInfo(url);

        //--------------------------------------

        let arr = [];

        ytStream.on('data', d => arr.push(d));

        //--------------------------------------

        ytStream.on('end', async () => {
            playStream(msg, Readable.from(arr), `${(await info).videoDetails.title}\n${url}`);
        });
    }
    catch (error) {
        msg.channel.send(error.toString());
        nextSong(msg);
    }
}

/**
 * gets the guild's audio player
 * 
 * if it doesn't exists, it will create the player for the guild
 * 
 * the player will automatically play the next song in the queue when the current song is done or throws an error
 * 
 * @param {*} msg 
 * @returns 
 */
function getPlayer(msg) {
    const id = msg.guild.id;
    let player = players.get(id);

    if (typeof player === 'undefined') {
        player = createAudioPlayer();
        const connection = getVoiceConnection(id);

        players.set(id, player);
        connection.subscribe(player);

        //--------------------------------------

        player.on('error', error => {
            msg.channel.send(error.toString());
            nextSong(msg);
        });

        player.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle) {
                nextSong(msg);
            }
        });
    }

    return player;
}

/**
 * play a readable stream
 * 
 * @param {*} msg 
 * @param {*} stream readable stream
 * @param {*} title optional title
 */
function playStream(msg, stream, title = '') {
    const player = getPlayer(msg);

    if (title.length) {
        msg.channel.send(`Now playing:\n${title}`);
    }

    player.play(createAudioResource(stream));
}

/**
 * play a file
 * 
 * @param {*} msg 
 * @param {*} file string file path
 * @param {*} title optional title
 */
function playFile(msg, file, title = '') {
    playStream(msg, createReadStream(resolve(file)), title);
}

/**
 * pause an audio player of a guild
 * 
 * @param {*} guildID 
 * @returns 
 */
function pause(guildID) {
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        return;
    }

    player.pause(true);
}

/**
 * resume an audio player of a guild
 * 
 * @param {*} guildID 
 * @returns 
 */
function resume(guildID) {
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        return;
    }

    player.unpause();
}

/**
 * skips the current song or skips to an index in the queue
 * 
 * @param {*} msg 
 * @param {*} index index of a certain song skip to
 * @returns 
 */
function skip(msg, index = 0) {
    const guildID = msg.guild.id;

    if (index) {
        if (audioQueue.jump(guildID, index)) {
            msg.reply(`Fetching song...`);
            playSong(msg);
        }
        else {
            msg.reply('No negative numbers or numbers bigger than the queue size!');
        }
    }
    else {
        const player = players.get(guildID);

        if (typeof player === 'undefined') {
            msg.reply('No songs to skip');
        }
        else {
            msg.reply('Song skipped');
            player.stop(); // the event listener will call nextSong()
        }
    }
}

/**
 * gets the song at the front of the queue and then plays it
 * 
 * @param {*} msg 
 */
function playSong(msg) {
    const url = audioQueue.getCurrentSong(msg.guild.id);

    youtubeToStream(msg, url);
}

/**
 * removes the current song and then plays the next one
 * 
 * the bot will leave the voice channel if there are no more songs in the queue
 * 
 * @param {*} msg 
 */
function nextSong(msg) {
    const guildID = msg.guild.id;

    if (audioQueue.pop(guildID)) {
        playSong(msg);
    }
    else {
        leaveVC(guildID);
    }
}

/**
 * returns true if the user is in a vc with the bot
 * 
 * if the user is in a vc and the bot is not
 * the function will return true if 'strict' is false
 * and false if 'strict' is true
 * 
 * @param {*} msg 
 * @param {*} strict ignore the case when the user is in a vc and bot is not
 * @returns 
 */
function vcCheck(msg, strict = false) {
    if (!msg.member.voice.channel) {
        msg.reply('Please join a voice channel');
        return false;
    }

    if (msg.guild.me.voice && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
        if (msg.guild.me.voice.channel.id === msg.member.voice.channel.id) {
            return true;
        }

        msg.reply('Please join the voice channel the bot is in');
        return false;
    }

    return !strict;
}

/**
 * returns true if the user is in a vc with the bot
 * 
 * if the user is in a vc and the bot is not
 * it will join the user's vc and return true
 * 
 * @param {*} msg 
 * @returns 
 */
function joinVC(msg) {
    if (!msg.member.voice.channel) {
        msg.reply('Please join a voice channel');
        return false;
    }

    if (msg.guild.me.voice && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
        if (msg.guild.me.voice.channel.id !== msg.member.voice.channel.id) {
            msg.reply('Please join the voice channel the bot is in');
            return false;
        }
    }
    else {
        joinVoiceChannel({
            channelId: msg.member.voice.channel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator
        });
    }

    return true;
}

/**
 * makes the bot leave the vc, deletes the guild's audio player, and deletes the guild's queue
 * 
 * @param {*} guildID 
 */
function leaveVC(guildID) {
    getVoiceConnection(guildID).destroy();
    players.delete(guildID);
    audioQueue.deleteQueue(guildID);
}
