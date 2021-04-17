const {
    derp,
    tagSeparator
} = require('../config.json');
const msgUtils = require('../lib/msgUtils.js');
const stringUtils = require('../lib/stringUtils.js');
const axios = require('axios');
const {
    RateLimiterMemory,
    RateLimiterQueue
} = require('rate-limiter-flexible');

const limit = new RateLimiterMemory({
    points: 10,
    duration: 1
});
const rateLimiter = new RateLimiterQueue(limit);
const URL = `${derp.API}${derp.APIKey}&q=`;

module.exports = {
    names: derp.names,
    description: derp.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: true,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator);

        const {
            imgURL,
            source,
            results
        } = await getImage(args);

        msgUtils.sendImg(msg.channel, imgURL, source, results);
    },
    getImage
}

/**
 * Returns an image, a source url, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getImage(tagArr) {
    await rateLimiter.removeTokens(1);

    // whitespace is replaced with '+'
    // tags are separated by '%2C'
    // '-' infront of a tag means to exclude it
    const tags = stringUtils.tagArrToStr(tagArr, derp.whitespace, derp.separator);
    
    let imgURL = '';
    let source = '';
    let results = 0;

    try {
        const response = await axios.get(`${URL}${tags}`);
        results = parseInt(response.data.total);

        if (results) {
            const img = response.data.images[0];

            imgURL = img.representations.full;
            source = `${derp.URL}${img.id}`;
        }
    }
    catch (error) {
        console.log(error);
    }

    return {
        imgURL,
        source,
        results
    };
}