import config from '../../config/config.json' assert { type: 'json' };
import { randomInteger } from './randomFunctions.js';
import { backOff } from './urlUtils.js';
import PQueue from 'p-queue';
import { default as nodeFetch } from 'node-fetch';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

const memes = config.memes;

// posts a daily meme
export async function getMeme() {
    const URL = `${memes.URLs[randomInteger(memes.URLs.length)]}${memes.queryString}${memes.postCount}`;
    let memeURL = '';

    await queue.add(async () => {
        const response = await nodeFetch(URL, {
            headers: {
                'User-Agent': config.userAgents[randomInteger(config.userAgents.length)] // reddit api requires a user agent. some are blocked thus the user of browser user agents
            }
        });

        if (backOff(response, queue)) {
            return;
        }

        try {
            const postArr = (await response.json()).data.children;
            const post = postArr[randomInteger(postArr.length)];

            memeURL = post.data.url;
        }
        catch (error) {
            console.log(error);
        }
    });

    return memeURL;
}
