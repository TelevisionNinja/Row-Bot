import { default as ytdl } from 'ytdl-core';
import { Readable } from 'stream';
import {
    pop,
    push,
    get,
    deleteQueue,
    popIndex
} from './audioQueue.js';
import {
    createAudioPlayer,
    joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    AudioPlayerStatus
} from '@discordjs/voice';

let players = new Map();

export async function playYoutube(msg, url, moreInfo = '') {
    const id = msg.guild.id;

    push(id, url);

    if (get(id).length > 1) {
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

function playStream(msg, stream, title) {
    const player = getPlayer(msg);

    msg.channel.send(`Now playing\n${title}`);
    player.play(createAudioResource(stream));
}

export function playFile(msg, file) {
    const player = getPlayer(msg);

    player.play(createAudioResource(file));
}

export function pause(guildID) {
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        return;
    }

    player.pause(true);
}

export function resume(guildID) {
    const player = players.get(guildID);

    if (typeof player === 'undefined') {
        return;
    }

    player.unpause();
}

/**
 * skips the current song or a song in the queue
 * 
 * @param {*} msg 
 * @param {*} index index of certain song to skip
 * @returns 
 */
export function skip(msg, index = 0) {
    const guildID = msg.guild.id;

    if (index) {
        if (index < 0) {
            return;
        }

        const queue = get(guildID);

        if (index >= queue.length) {
            return;
        }

        msg.channel.send(`Song skipped: ${queue[index]}`);
        popIndex(guildID, index);
    }
    else {
        const player = players.get(guildID);

        if (typeof player === 'undefined') {
            return;
        }

        player.stop(true);
        nextSong(msg);
    }
}

function nextSong(msg) {
    const guildID = msg.guild.id;

    if (pop(guildID)) {
        const url = get(guildID)[0];

        youtubeToStream(msg, url);
    }
    else {
        players.delete(guildID);
    }
}

/**
 * returns true if there is an existing vc or the bot joined a vc
 * 
 * @param {*} msg 
 * @returns 
 */
export function joinVC(msg) {
    if (!msg.member.voice.channel) {
        msg.channel.send('Please join a voice channel');
        return false;
    }

    const guildID = msg.guild.id;

    if (msg.guild.me.voice && typeof getVoiceConnection(guildID) !== 'undefined') {
        if (msg.guild.me.voice.channel.id === msg.member.voice.channel.id) {
            return true;
        }

        msg.channel.send('Please join the voice channel the bot is already in');
        return false;
    }

    joinVoiceChannel({
        channelId: msg.member.voice.channel.id,
        guildId: guildID,
        adapterCreator: msg.guild.voiceAdapterCreator
    });

    return true;
}

/**
 * returns true if the user is in a vc with the bot or the user is in a vc and the bot is not
 * 
 * @param {*} msg 
 * @returns 
 */
export function vcCheck(msg) {
    if (!msg.member.voice.channel) {
        msg.channel.send('Please join a voice channel');
        return false;
    }

    const guildID = msg.guild.id;

    if (msg.guild.me.voice && typeof getVoiceConnection(guildID) !== 'undefined') {
        if (msg.guild.me.voice.channel.id === msg.member.voice.channel.id) {
            return true;
        }

        msg.channel.send('Please join the voice channel the bot is already in');
        return false;
    }

    return true;
}

export function leave(guildID) {
    getVoiceConnection(guildID).destroy();
    players.delete(guildID);
    deleteQueue(guildID);
}
