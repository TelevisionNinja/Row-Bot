const { tenorAPIKey } = require('../config.json');
const rand = require('../lib/randomFunctions.js');
const axios = require('axios');

module.exports = {
    name: 'gif',
    aliases: [],
    fileName: __filename,
    description: 'Returns a gif',
    args: true,
    guildOnly: false,
    usage: '<search terms>',
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
            msg.channel.send('Aww there\'s no results 😢');
        }
    }
}

/**
 * Returns a gif and a boolean for whether of not there's a result.
 * If no gif is found, the hasResult var is returned as false.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getGif(tagArr) {
    const searchTerms = tagArr.join(' ');
    const url = `https://api.tenor.com/v1/search?q=${searchTerms}&key=${tenorAPIKey}&limit=50&media_filter=minimal`;

    let gif = '';
    let hasResult = false;

    try {
        const response = await axios.get(url);
        const gifArr = response.data.results;

        if (gifArr.length) {
            gif = gifArr[rand.randomMath(gifArr.length)].url;
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