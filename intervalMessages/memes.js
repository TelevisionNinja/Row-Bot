import DailyInterval from 'daily-intervals';
import { getChannel } from '../lib/msgUtils.js';
import config from '../config.json' assert { type: 'json' };
import { randomMath } from '../lib/randomFunctions.js';

const memes = config.memes;

// posts a daily meme
export async function execute(client) {
    const recipient = await getChannel(client, memes.channelID);

    const interval = new DailyInterval(
        async () => {
            const URL = `${memes.URLs[randomMath(memes.URLs.length)]}${memes.queryString}${memes.postCount}`;
            const response = await fetch(URL);

            try {
                const postArr = (await response.json()).data.children;
                const post = postArr[randomMath(memes.postCount)];

                recipient.send(post.data.url);
            }
            catch (error) {
                console.log(error);
            }
        },
        '0:0',
        360,
        5000 // 5 second offset
    );

    interval.start();
}
