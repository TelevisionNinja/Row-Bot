import { default as ytdl } from 'ytdl-core-discord';
import { Readable } from 'stream';
import {
    pop,
    push,
    get
} from './audioQueue.js';

let players = new Map();

export async function playYoutube(msg, connection, url, moreInfo = '') {
    const id = msg.guild.id;

    push(id, url);

    if (get(id).length - 1) {
        msg.channel.send('Added to the queue');
        return;
    }

    //--------------------------------------

    try {
        const ytStream = await ytdl(url, {
            filter: 'audioonly'
        });
        const info = ytdl.getInfo(url);

        //--------------------------------------

        let arr = [];

        ytStream.on('data', d => arr.push(d));

        //--------------------------------------

        ytStream.on('end', async () => {
            const stream = Readable.from(arr);

            //--------------------------------------

            let title = (await info).videoDetails.title;

            if (moreInfo.length) {
                title = `${title}\n${moreInfo}`;
            }

            play(msg, connection, stream, title);
        });
    }
    catch (error) {
        msg.channel.send(error.toString());
    }
}

async function youtubeToStream(msg, connection, url) {
    try {
        const ytStream = await ytdl(url, {
            filter: 'audioonly'
        });
        const info = ytdl.getInfo(url);

        //--------------------------------------

        let arr = [];

        ytStream.on('data', d => arr.push(d));

        //--------------------------------------

        ytStream.on('end', async () => {
            const stream = Readable.from(arr);

            //--------------------------------------

            play(msg, connection, stream, `${(await info).videoDetails.title}\n${url}`);
        });
    }
    catch (error) {
        msg.channel.send(error.toString());
        nextSong(msg.guild.id, msg, connection);
    }
}

function play(msg, connection, stream, title) {
    msg.channel.send(`Now playing\n${title}`);

    //--------------------------------------

    const dispatcher = connection.play(stream, {
        highWaterMark: 50,
        //volume: false,
        type: 'opus',
        bitrate: 'auto'
    });

    //--------------------------------------

    const id = msg.guild.id;

    players.set(id, dispatcher);

    //--------------------------------------

    dispatcher.on('error', error => {
        console.log(error);

        let time = ~~(dispatcher.streamTime / 1000);
        const sec = time % 60;
        time = ~~(time / 60);
        const min = time % 60;
        const hr = ~~(time / 60);

        let timeStr = `${min}:${sec}`;

        if (hr) {
            timeStr = `${hr}:${timeStr}`;
        }

        msg.channel.send(`Lost connection. Stopped at ${timeStr}`);
        nextSong(id, msg, connection);
    });

    dispatcher.on('finish', () => {
        nextSong(id, msg, connection);
    });
}

export function pause(guildID) {
    const dispatcher = players.get(guildID);

    dispatcher.pause(true);
}

export function resume(guildID) {
    const dispatcher = players.get(guildID);

    dispatcher.resume();
}

export function skip(msg) {
    nextSong(msg.guild.id, msg, msg.guild.voice.connection);
}

function nextSong(guildID, msg, connection) {
    if (pop(guildID)) {
        const url = get(guildID)[0];

        youtubeToStream(msg, connection, url);
    }
    else {
        const dispatcher = players.get(guildID);

        dispatcher.destroy();
        players.delete(guildID);
    }
}
