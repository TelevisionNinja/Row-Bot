const {
    tenor,
    noResultsMsg
} = require('../config.json');
const axios = require('axios');
const {
    RateLimiterMemory,
    RateLimiterQueue
} = require('rate-limiter-flexible');

const limit = new RateLimiterMemory({
    points: 10,
    duration: 1,
  });
const rateLimiter = new RateLimiterQueue(limit);
const URL = `${tenor.API}${tenor.APIKey}&q=`;

module.exports = {
    names: tenor.names,
    description: tenor.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<search terms separated by a space>',
    cooldown: 1,
    async execute(msg, args) {
        const {
            gif,
            hasResult
        } = await getGif(args);

        if (hasResult) {
            msg.channel.send(gif);
        }
        else {
            msg.channel.send(noResultsMsg);
        }
    },
    getGif
}

/**
 * Returns a gif and a boolean for whether of not there's a result.
 * If no gif is found, the hasResult var is returned as false.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getGif(tagArr) {
    await rateLimiter.removeTokens(1);

    const searchTerms = encodeURIComponent(tagArr.join(' '));
    const searchURL = `${URL}${searchTerms}`;

    let gif = '';
    let hasResult = false;

    try {
        const response = await axios.get(searchURL);
        const gifArr = response.data.results;

        if (gifArr.length) {
            gif = gifArr[0].url;
            hasResult = true;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        gif,
        hasResult
    };
}