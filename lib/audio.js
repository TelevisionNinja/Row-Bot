import { default as ytdl } from 'ytdl-core-discord';
import { Readable } from 'stream';

export async function playYoutube(msg, connection, url) {
    try {
        const ytStream = await ytdl(url);
        const info = ytdl.getInfo(url);

        //--------------------------------------

        let arr = [];

        ytStream.on('data', d => arr.push(d));

        //--------------------------------------

        ytStream.on('end', async () => {
            const stream = Readable.from(arr);

            msg.channel.send(`Now playing\n${(await info).videoDetails.title}`);

            //--------------------------------------

            const dispatcher = connection.play(stream, {
                highWaterMark: 50,
                volume: false,
                type: 'opus'
            });

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
            });
        });
    }
    catch (error) {
        msg.channel.send(error.toString());
    }
}
