import DailyInterval from 'daily-intervals';
import { default as config } from '../config.json';
import axios from 'axios';
import { randomMath } from '../lib/randomFunctions.js';

const memes = config.memes;

export default {
    description: memes.description,
    async execute(client) {
        const interval = new DailyInterval(
            async () => {
                try {
                    const URL = `${memes.URLs[randomMath(memes.URLs.length)]}${memes.postCount}`;
                    const response = await axios.get(URL);
                    const postArr = response.data.data.children;

                    const post = postArr[randomMath(memes.postCount)];

                    client.createMessage(memes.channelID, encodeURI(post.data.url));
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
}