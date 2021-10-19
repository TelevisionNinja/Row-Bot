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
    leave,
    vcCheckInteraction,
    joinVCInteraction,
    skipInteraction,
    remove,
    removeInteraction
}

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
 * 
 * @param {*} msg 
 * @param {*} file string file path
 * @param {*} title optional title
 */
function playFile(msg, file, title = '') {
    playStream(msg, createReadStream(resolve(file)), title);
}

function pause(guildID) {
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        return;
    }

    player.pause(true);
}

function resume(guildID) {
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        return;
    }

    player.unpause();
}

/**
 * skips the current song or skips to a song in the queue
 * 
 * @param {*} msg 
 * @param {*} index index of a certain song skip to
 * @returns 
 */
function skip(msg, index = 0) {
    const guildID = msg.guild.id;

    if (index) {
        if (audioQueue.jump(guildID, index)) {
            playSong(msg);
        }
    }
    else {
        const player = players.get(guildID);

        if (typeof player !== 'undefined') {
            player.stop(); // the state listener will call nextSong()
        }
    }
}

/**
 * removes a song in the queue
 * 
 * @param {*} msg 
 * @param {*} index index of certain song to remove
 * @returns 
 */
function remove(msg, index) {
    const guildID = msg.guild.id;

    if (index) {
        if (index < 0) {
            return;
        }

        const queue = audioQueue.get(guildID);

        if (index >= queue.length || !queue.length || queue.length === 1) {
            return;
        }

        msg.channel.send(`Song removed: ${queue[index]}`);
        audioQueue.popIndex(guildID, index);
    }
    else {
        msg.channel.send('You can\'t remove the current song');
    }
}

/**
 * skips the current song or skips to a song in the queue
 * 
 * @param {*} interaction 
 * @param {*} index index of a certain song skip to
 * @returns 
 */
function skipInteraction(interaction, index = 0) {
    const guildID = interaction.guild.id;

    if (index) {
        if (audioQueue.jump(guildID, index)) {
            interaction.reply(`Fetching song...`);
            playSong(interaction);
        }
        else {
            interaction.reply('No negative numbers or numbers bigger than the queue size!');
        }
    }
    else {
        const player = players.get(guildID);

        if (typeof player === 'undefined') {
            interaction.reply('No songs to skip');
        }
        else {
            interaction.reply('Song skipped');
            player.stop(); // the state listener will call nextSong()
        }
    }
}

/**
 * removes a song in the queue
 * 
 * @param {*} interaction 
 * @param {*} index index of certain song to remove
 * @returns 
 */
function removeInteraction(interaction, index) {
    const guildID = interaction.guild.id;

    if (index) {
        if (index < 0) {
            interaction.reply('No negative numbers!');
            return;
        }

        const queue = audioQueue.get(guildID);

        if (!queue.length || queue.length === 1) {
            interaction.reply('No songs to remove');
            return;
        }

        if (index >= queue.length) {
            interaction.reply('No numbers bigger than the queue size!');
            return;
        }

        interaction.reply(`Song removed: ${queue[index]}`);
        audioQueue.popIndex(guildID, index);
    }
    else {
        interaction.reply('You can\'t remove the current song');
    }
}

function playSong(msg) {
    const url = audioQueue.getCurrentSong(msg.guild.id);

    youtubeToStream(msg, url);
}

function nextSong(msg) {
    const guildID = msg.guild.id;

    if (audioQueue.pop(guildID)) {
        playSong(msg);
    }
    else {
        players.delete(guildID);
    }
}

/**
 * returns true if the user is in a vc with the bot or the user is in a vc and the bot is not
 * 
 * @param {*} msg 
 * @returns 
 */
function vcCheck(msg) {
    if (!msg.member.voice.channel) {
        msg.channel.send('Please join a voice channel');
        return false;
    }

    if (msg.guild.me.voice && typeof getVoiceConnection(msg.guild.id) !== 'undefined') {
        if (msg.guild.me.voice.channel.id === msg.member.voice.channel.id) {
            return true;
        }

        msg.channel.send('Please join the voice channel the bot is in');
        return false;
    }

    return true;
}

/**
 * returns true if the user is in a vc with the bot or the user is in a vc and the bot is not
 * 
 * @param {*} interaction 
 * @returns 
 */
function vcCheckInteraction(interaction) {
    if (!interaction.member.voice.channel) {
        interaction.reply('Please join a voice channel');
        return false;
    }

    if (interaction.guild.me.voice && typeof getVoiceConnection(interaction.guild.id) !== 'undefined') {
        if (interaction.guild.me.voice.channel.id === interaction.member.voice.channel.id) {
            return true;
        }

        interaction.reply('Please join the voice channel the bot is in');
        return false;
    }

    return true;
}

/**
 * returns true if there is an existing vc or the bot joined a vc
 * 
 * @param {*} msg 
 * @returns 
 */
function joinVC(msg) {
    if (vcCheck(msg)) {
        joinVoiceChannel({
            channelId: msg.member.voice.channel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator
        });

        return true;
    }

    return false;
}

/**
 * returns true if there is an existing vc or the bot joined a vc
 * 
 * @param {*} interaction 
 * @returns 
 */
function joinVCInteraction(interaction) {
    if (vcCheckInteraction(interaction)) {
        joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });

        return true;
    }

    return false;
}

function leave(guildID) {
    getVoiceConnection(guildID).destroy();
    players.delete(guildID);
    audioQueue.deleteQueue(guildID);
}
