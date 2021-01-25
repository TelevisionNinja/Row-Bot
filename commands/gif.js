const { tenor } = require('../config.json');
const axios = require('axios');

const URL = `${tenor.API}${tenor.APIKey}&q=`;

module.exports = {
    names: tenor.names,
    description: tenor.description,
    args: true,
    permittedCharsOnly: false,
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