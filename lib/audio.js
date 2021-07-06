import { default as ytdl } from 'ytdl-core-discord';
import { Readable } from 'stream';

let queues = new Map();
let players = new Map();

export async function playYoutube(msg, connection, url, moreInfo = '') {
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

    players.set(msg.guild.id, dispatcher);

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
        players.delete(msg.guild.id);
    });

    dispatcher.on('finish', () => {
        players.delete(msg.guild.id);
    });
}

export function pause(msg) {
    const dispatcher = players.get(msg.guild.id);

    dispatcher.pause(true);
}

export function resume(msg) {
    const dispatcher = players.get(msg.guild.id);

    dispatcher.resume();
}
