const {
    derp,
    tagSeparator
} = require('../config.json');
const sendMsg = require('../lib/msgUtils.js');
const stringUtils = require('../lib/stringUtils.js');
const axios = require('axios');

const URL = `${derp.API}${derp.APIKey}&q=`;

module.exports = {
    names: derp.names,
    fileName: __filename,
    description: derp.description,
    args: true,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        const {
            imgURL,
            source,
            results
        } = await getImage(args);
        
        sendMsg.sendImg(msg.channel, imgURL, source, results);
    },
    getImage
}

/**
 * Returns an image, a source url, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * Best case: 1 request
 * Worst case: 2 requests
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getImage(tagArr) {
    // whitespace is replaced with '+'
    // tags are separated by '%2C'
    const tags = stringUtils.tagsToStr(tagArr, derp.whitespace, derp.separator);
    
    let imgURL = '';
    let source = '';
    let results = 0;

    if (tags !== '') {
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
    }

    return {
        imgURL,
        source,
        results
    }
}