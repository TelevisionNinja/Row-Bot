import { default as config } from '../config.json';
import axios from 'axios';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const tenor = config.tenor,
    noResultsMsg = config.noResultsMsg;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 10
});
const URL = `${tenor.API}${tenor.APIKey}&q=`;

export default {
    names: tenor.names,
    description: tenor.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<search terms separated by a space>',
    cooldown: 1,
    async execute(msg, args) {
        const {
            gif,
            hasResult
        } = await getGif(args);

        if (hasResult) {
            msg.channel.createMessage(gif);
        }
        else {
            msg.channel.createMessage(noResultsMsg);
        }
    }
}

/**
 * Returns a gif and a boolean for whether of not there's a result.
 * If no gif is found, the hasResult var is returned as false.
 * 
 * @param {*} tagArr array of tags to be searched
 */
export async function getGif(tagArr) {
    const searchTerms = encodeURIComponent(tagArr.join(' '));
    let gif = '';
    let hasResult = false;

    await queue.add(async () => {
        try {
            const response = await axios.get(`${URL}${searchTerms}`);
            const gifArr = response.data.results;

            if (gifArr.length) {
                gif = gifArr[0].url;
                hasResult = true;
            }
        }
        catch (error) {
            backOff(error, queue);
        }
    });

    return {
        gif,
        hasResult
    };
}