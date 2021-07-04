import { default as ytdl } from 'ytdl-core-discord';

export async function playYoutube(msg, connection, url) {
    try {
        const info = await ytdl.getInfo(url);
        msg.channel.send(`Now playing\n${info.videoDetails.title}`);

        const dispatcher = connection.play(await ytdl(url), {
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

            msg.channel.send(`Lost connection. Stopped at ${hr}:${min}:${sec}`);
        });
    }
	catch (error) {
        console.log(error);
        msg.channel.send('That\'s not a supported link');
    }
}
