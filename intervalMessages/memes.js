import DailyInterval from 'daily-intervals';
import { getRecipient } from '../lib/msgUtils.js';
import { default as config } from '../config.json';
import axios from 'axios';
import { randomMath } from '../lib/randomFunctions.js';

const memes = config.memes;

export default {
    description: memes.description,
    async execute(client) {
        const recipient = await getRecipient(client, memes.channelID);

        const interval = new DailyInterval(
            async () => {
                try {
                    const URL = `${memes.URLs[randomMath(memes.URLs.length)]}${memes.postCount}`;
                    const response = await axios.get(URL);
                    const postArr = response.data.data.children;

                    const post = postArr[randomMath(memes.postCount)];

                    recipient.createMessage(encodeURI(post.data.url));
                }
                catch (error) {
                    console.log(error);
                }
            },
            '0:0',
            180,
            5000 // 5 second offset
        );

        interval.start();
    }
}