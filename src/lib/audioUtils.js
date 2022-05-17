import { default as ytdl } from 'ytdl-core';
import { default as audioQueue } from './audioQueue.js';
import {
    createAudioPlayer,
    joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    demuxProbe
} from '@discordjs/voice';
import { createReadStream } from 'fs';
import { resolve } from 'path';

let players = new Map();

export default {
    queueASong,
    playStream,
    playFile,
    playCurrentSong,
    pause,
    resume,
    skip,
    vcCheck,
    joinVC,
    leaveVC
}

/**
 * 
 * @param {*} url 
 * @returns 
 */
async function getYoutubeTitle(url) {
    const info = await ytdl.getInfo(url);
    return `${info.videoDetails.title}\n${url}`;
}

/**
 * gets the audio from the youtube url and plays it
 * 
 * @param {*} msg 
 * @param {*} url 
 */
async function fetchAndPlayYoutubeAudio(msg, url) {
    const ytStream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio'
    });

    playStream(msg, ytStream, await getYoutubeTitle(url));
}

/**
 * play a youtube link
 * 
 * @param {*} msg 
 * @param {*} url 
 * @param {*} sendReply send a reply that says the song was queued
 * @returns bool for whether the song is the current song
 */
function queueASong(msg, url, sendReply = true) {
    const id = msg.guild.id;
    const queued = audioQueue.getCurrentSong(id).length !== 0;
    audioQueue.push(id, url);

    if (queued && sendReply) {
        msg.reply(`Added to the queue:\n${url}`);
    }

    return !queued;
}

/**
 * gets a readable stream from a youtube link and then plays the stream
 * 
 * @param {*} msg 
 * @param {*} url 
 */
async function playYoutube(msg, url) {
    try {
        await fetchAndPlayYoutubeAudio(msg, url);
    }
    catch (error) {
        msg.channel.send(`Music queue error:\n${error.toString()}`);
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

        //--------------------------------------

        player.on('error', error => {
            msg.channel.send(`Music player error:\n${error.toString()}`);
            nextSong(msg);
        });

        player.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle) {
                nextSong(msg);
            }
        });

        //--------------------------------------

        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                ]);
            }
            catch (error) {
                leaveVC(id);
            }
        });

        connection.subscribe(player);
    }

    return player;
}

/**
 * 
 * @param {*} readableStream 
 * @returns 
 */
async function probeAndCreateResource(readableStream) {
    try {
        const {
            stream,
            type
        } = await demuxProbe(readableStream);

        return createAudioResource(stream, { inputType: type });
    }
    catch (error) {
        console.log(error);
    }

    return createAudioResource(readableStream);
}

/**
 * play a readable stream
 * 
 * @param {*} msg 
 * @param {*} stream readable stream
 * @param {*} title optional title
 */
async function playStream(msg, stream, title = '') {
    const player = getPlayer(msg);

    player.play(await probeAndCreateResource(stream));

    if (title.length) {
        msg.channel.send(`Now playing:\n${title}`);
    }
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
 * @param {*} msg 
 * @returns 
 */
function resume(msg) {
    const player = players.get(msg.guild.id);

    if (typeof player === 'undefined') {
        return;
    }

    if (player.state.status === AudioPlayerStatus.Paused) {
        player.unpause();
    }
}

/**
 * skips the current song or skips to an index in the queue
 * 
 * @param {*} msg 
 * @param {*} index index of a certain song skip to
 * @returns 
 */
async function skip(msg, index = 0) {
    const guildID = msg.guild.id;

    if (index) {
        if (audioQueue.jump(guildID, index)) {
            msg.reply(`Skipped to song #${index} in the queue. Fetching the song...`);
            playCurrentSong(msg);
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
            if (player.state.status === AudioPlayerStatus.Paused) {
                if (audioQueue.pop(guildID)) {
                    msg.reply(`Song skipped. The new current song:\n${await getYoutubeTitle(audioQueue.getCurrentSong(guildID))}`);
                }
                else {
                    msg.reply('No songs left to skip');
                    deletePlayer(guildID);
                }
            }
            else {
                msg.reply('Song skipped');
                // the event listener will call nextSong(). this is done so that the audio will stop playing immediately
                player.stop();
            }
        }
    }
}

/**
 * gets the song at the front of the queue and then plays it
 * 
 * @param {*} msg 
 */
function playCurrentSong(msg) {
    const url = audioQueue.getCurrentSong(msg.guild.id);

    playYoutube(msg, url);
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
        playCurrentSong(msg);
    }
    else {
        // leaveVC(guildID);
        deletePlayer(guildID);
    }
}

/**
 * returns true if the user is in a vc with the bot
 * 
 * @param {*} msg 
 * @param {*} noVCMsg show message of bot not in any vc
 * @returns 
 */
function vcCheck(msg, noVCMsg = true) {
    if (!msg.member.voice.channel) {
        msg.reply('Please join a voice channel');
        return false;
    }

    if (msg.guild.me.voice && msg.guild.me.voice.channel && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
        if (msg.guild.me.voice.channel.id === msg.member.voice.channel.id) {
            return true;
        }

        msg.reply('Please join the voice channel that I\'m in');
    }
    else {
        if (noVCMsg) {
            msg.reply('Command cancelled because I\'m not in any voice channel');
        }
    }

    return false;
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

    if (msg.guild.me.voice && msg.guild.me.voice.channel && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
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
 * deletes the player and queue
 * 
 * @param {*} guildID 
 */
function deletePlayer(guildID) {
    players.delete(guildID);
    audioQueue.deleteQueue(guildID);
}

/**
 * makes the bot leave the vc, deletes the guild's audio player, and deletes the guild's queue
 * 
 * @param {*} guildID 
 */
function leaveVC(guildID) {
    const connection = getVoiceConnection(guildID);

    if (typeof connection !== 'undefined') {
        connection.destroy();
    }

    deletePlayer(guildID);
}
