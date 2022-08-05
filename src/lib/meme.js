import config from '../../config/config.json' assert { type: 'json' };
import { randomMath } from './randomFunctions.js';
import { backOff } from './urlUtils.js';
import PQueue from 'p-queue';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

const memes = config.memes;

// posts a daily meme
export async function getMeme() {
    const URL = `${memes.URLs[randomMath(memes.URLs.length)]}${memes.queryString}${memes.postCount}`;
    let memeURL = '';

    await queue.add(async () => {
        const response = await fetch(URL);

        if (backOff(response, queue)) {
            return;
        }

        try {
            const postArr = (await response.json()).data.children;
            const post = postArr[randomMath(memes.postCount)];

            memeURL = post.data.url;
        }
        catch (error) {
            console.log(error);
        }
    });

    return memeURL;
}
