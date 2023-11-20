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
import path from 'path';
import {
    stream,
    video_basic_info,
    setToken
} from 'play-dl';
import PQueue from 'p-queue';

let players = new Map();

const queue = new PQueue({
    interval: 1000,
    intervalCap: 100
});

const disconnectTimers = new Map();
const disconnectTimeout = 1000 * 60; // 1 min

async function getSoundCloudClientID(retryNumber = 0) {
    try {
        const response = await fetch('https://soundcloud.com/');
        const body = await response.text();

        //----------------------------------------------------

        const urls = body.split('<script crossorigin src="');

        for (let i = 0, length = urls.length; i < length; i++) {
            const currentURL = urls[i];
            const end = currentURL.indexOf('"');
            urls[i] = currentURL.substring(0, end);
        }

        //----------------------------------------------------

        let responses = [];

        for (let i = 0, length = urls.length; i < length; i++) {
            responses.push(fetch(urls[i]));
        }

        responses = await Promise.allSettled(responses);
        let finalBodies = [];

        for (let i = 0, length = responses.length; i < length; i++) {
            const responseObject = responses[i];

            if (responseObject.status === 'fulfilled') {
                finalBodies.push(responseObject.value.text());
            }
        }

        //----------------------------------------------------

        finalBodies = await Promise.allSettled(finalBodies);

        for (let i = 0, length = finalBodies.length; i < length; i++) {
            const responseObject = finalBodies[i];

            if (responseObject.status === 'fulfilled') {
                let startString = ',client_id:"';
                let startIndex = responseObject.value.indexOf(startString);

                if (startIndex === -1) {
                    startString = '{client_id:"';
                    startIndex = responseObject.value.indexOf(startString);
                }

                if (startIndex !== -1) {
                    startIndex += startString.length;

                    const endIndex = responseObject.value.indexOf('"', startIndex);
                    return responseObject.value.substring(startIndex, endIndex);
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }

    //----------------------------------------------------

    if (retryNumber < 2) {
        return getSoundCloudClientID(retryNumber + 1);
    }

    return '';
}

setToken({
    soundcloud: {
        client_id: await getSoundCloudClientID()
    }
});

export default {
    // these clear the disconnect timer
    queueASong,
    playReadableStream,
    playFile,

    // these do not clear the disconnect timer
    playCurrentSong,
    playURL,

    pause,
    resume,
    skip,

    vcCheck,
    joinVC,
    leaveVC,
    probeAndCreateResource,
    getYoutubeTitle,

    getPlayer,
    deletePlayer
}

function clearDisconnectTimer(guildID) {
    const timer = disconnectTimers.get(guildID);

    if (typeof timer !== 'undefined') {
        clearTimeout(timer);
        disconnectTimers.delete(guildID);
    }
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
    clearDisconnectTimer(guildID);
}

function setDisconnectTimer(guildID) {
    const timer = disconnectTimers.get(guildID);

    if (typeof timer !== 'undefined') {
        clearTimeout(timer);
    }

    disconnectTimers.set(guildID, setTimeout(() => leaveVC(guildID), disconnectTimeout));
}

/**
 * 
 * @param {*} url 
 * @returns 
 */
async function getYoutubeTitle(url) {
    try {
        const info = await queue.add(() => video_basic_info(url));
        return `${info.video_details.title}\n${url}`;
    }
    catch (error) {
        return url;
    }
}

/**
 * gets the audio from the youtube/soundcloud url and plays it
 * 
 * @param {*} msg 
 * @param {*} url 
 */
async function fetchAndPlayURLAudio(msg, url) {
    const streamObject = await queue.add(() => stream(url));

    playStream(msg, streamObject, await getYoutubeTitle(url));
}

/**
 * play a youtube/soundcloud link
 * 
 * @param {*} msg 
 * @param {*} url 
 * @param {*} sendReply send a reply that says the song was queued
 * @param {*} startPlaying start playing music when the first song is queued
 * @returns bool for whether the song is the current song (the only song in the queue)
 */
function queueASong(msg, url, sendReply = true, startPlaying = true) {
    const id = msg.guild.id;
    const isCurrent = audioQueue.getCurrentSong(id).length === 0;
    audioQueue.push(id, url);

    if (isCurrent) {
        clearDisconnectTimer(id);

        if (startPlaying) {
            playCurrentSong(msg);
        }
    }
    else {
        if (sendReply) {
            msg.reply(`Added to the queue:\n${url}`);
        }
    }

    return isCurrent;
}

/**
 * gets a readable stream from a youtube/soundcloud link and then plays the stream
 * 
 * @param {*} msg 
 * @param {*} url 
 */
async function playURL(msg, url) {
    try {
        await fetchAndPlayURLAudio(msg, url);
    }
    catch (error) {
        const id = msg.guild.id;
        const player = players.get(id);

        if (typeof player === 'undefined') {
            msg.channel.send(`Music Player ${error.toString()}`);
            audioQueue.deleteQueue(id);
        }
        else {
            player.emit('error', error);
        }
    }
}

/**
 * create a vc connection
 * 
 * @param {*} vcChannelID 
 * @param {*} guildID 
 * @param {*} voiceAdapterCreator 
 * @returns 
 */
function createVCConnection(vcChannelID, guildID, voiceAdapterCreator) {
    const connection = joinVoiceChannel({
        channelId: vcChannelID,
        guildId: guildID,
        adapterCreator: voiceAdapterCreator
    });

    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5000)
            ]);
        }
        catch (error) {
            leaveVC(guildID);
        }
    });

    return connection;
}

/**
 * create an audio player for a guild
 * 
 * @param {*} msg discord message obj
 * @param {*} id guild id
 */
async function createPlayer(msg, id) {
    const player = createAudioPlayer();

    player.on('error', async error => {
        await msg.channel.send(`Music Player ${error.toString()}\n${audioQueue.getCurrentSong(id)}`);
        nextSong(msg);
    });

    player.on('stateChange', (oldState, newState) => {
        if (newState.status === AudioPlayerStatus.Idle) {
            nextSong(msg);
        }
    });

    players.set(id, player);

    //--------------------------------------

    let connection = getVoiceConnection(id);

    if (typeof connection === 'undefined') {
        // the reply to the user's command is 'msg'
        // meaning the bot has no way of getting the voice channel id bc it left the vc
        // thus the user's command message/interaction needs to be fetched
        // to get the voice channel id
        let member = undefined;

        if (msg.interaction) {
            member = await msg.guild.members.fetch(msg.interaction.user.id);
        }
        else {
            member = (await msg.fetchReference()).member;
        }

        connection = createVCConnection(member.voice.channel.id, id, msg.guild.voiceAdapterCreator);
    }

    connection.subscribe(player);

    return player;
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
        return createPlayer(msg, id);
    }

    return player;
}

/**
 * 
 * @param {*} readableStream 
 * @returns 
 */
async function probeAndCreateResource(readableStream) {
    if (readableStream.type && readableStream.type.length) {
        return createAudioResource(readableStream.stream, { inputType: readableStream.type });
    }

    try {
        const {
            stream,
            type
        } = await demuxProbe(readableStream);

        return createAudioResource(stream, { inputType: type });
    }
    catch (error) {
        return createAudioResource(readableStream);
    }
}

/**
 * play a readable stream
 * 
 * @param {*} msg 
 * @param {*} stream readable stream
 * @param {*} title optional title
 */
async function playStream(msg, stream, title = '') {
    const player = await getPlayer(msg);

    player.play(await probeAndCreateResource(stream));

    if (title.length) {
        msg.channel.send(`Now playing:\n${title}`);
    }
}

/**
 * play a readable stream
 * 
 * @param {*} msg 
 * @param {*} stream readable stream
 * @param {*} title optional title
 */
function playReadableStream(msg, stream, title = '') {
    clearDisconnectTimer(msg.guild.id);
    playStream(msg, stream, title);
}

/**
 * play a file
 * 
 * @param {*} msg 
 * @param {*} file string file path
 * @param {*} title optional title
 */
function playFile(msg, file, title = '') {
    clearDisconnectTimer(msg.guild.id);
    playStream(msg, createReadStream(path.resolve(file)), title);
}

/**
 * pause an audio player of a guild
 * 
 * @param {*} guildID 
 * @returns 
 */
function pause(guildID) {
    const player = players.get(guildID);

    if (typeof player !== 'undefined') {
        player.pause(true);
    }
}

/**
 * resume an audio player of a guild
 * 
 * @param {*} msg 
 * @returns 
 */
function resume(msg) {
    const player = players.get(msg.guild.id);

    if (typeof player !== 'undefined' && player.state.status === AudioPlayerStatus.Paused) {
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
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        msg.reply('No songs to skip');
        return;
    }

    if (player.state.status === AudioPlayerStatus.Paused) {
        if (index) {
            if (audioQueue.jump(guildID, index)) {
                msg.reply(`Skipped to song #${index} in the queue. The new current song:\n${await getYoutubeTitle(audioQueue.getCurrentSong(guildID))}`);
            }
            else {
                msg.reply('No negative numbers or numbers bigger than the queue size!');
            }
        }
        else {
            if (audioQueue.pop(guildID)) {
                msg.reply(`Song skipped. The new current song:\n${await getYoutubeTitle(audioQueue.getCurrentSong(guildID))}`);
            }
            else {
                msg.reply('No songs left to skip');
                deletePlayer(guildID);
                setDisconnectTimer(guildID);
            }
        }
    }
    else {
        if (index) {
            if (audioQueue.jump(guildID, index)) {
                await msg.reply(`Skipped to song #${index} in the queue. Fetching the song...`);
                playCurrentSong(msg);
            }
            else {
                msg.reply('No negative numbers or numbers bigger than the queue size!');
            }
        }
        else {
            await msg.reply('Song skipped');
            // the event listener will call nextSong(). player.stop() is called so that the audio will stop playing immediately
            player.stop();
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

    playURL(msg, url);
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
        // leaveVC(guildID); // leaves the vc if there is nothing left to play

        deletePlayer(guildID); // stays in the vc when there is nothing left to play
        setDisconnectTimer(guildID); // automatically disconnects from the vc after a certain amount of time
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
    if (!(msg.member.voice && msg.member.voice.channel)) {
        msg.reply('Please join a voice channel');
        return false;
    }

    // msg.guild.members.me.voice can be undefined
    if (msg.guild.members.me.voice && msg.guild.members.me.voice.channel && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
        if (msg.guild.members.me.voice.channel.id === msg.member.voice.channel.id) {
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
    if (!(msg.member.voice && msg.member.voice.channel)) {
        msg.reply('Please join a voice channel');
        return false;
    }

    // msg.guild.members.me.voice can be undefined
    if (msg.guild.members.me.voice && msg.guild.members.me.voice.channel && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
        if (msg.guild.members.me.voice.channel.id !== msg.member.voice.channel.id) {
            msg.reply('Please join the voice channel the bot is in');
            return false;
        }
    }
    else {
        createVCConnection(msg.member.voice.channel.id, msg.guild.id, msg.guild.voiceAdapterCreator);
    }

    return true;
}
