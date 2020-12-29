const {
    derp,
    tagSeparator
} = require('../config.json');
const rand = require('../lib/randomFunctions.js');
const stringUtil = require('../lib/stringUtils.js');
const axios = require('axios');

const URL = `${derp.APIImg}${derp.APIKey}&q=`;
const URL50 = `${derp.APIImg50}${derp.APIKey}&q=`;

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

        if (results) {
            msg.channel.send(imgURL);
            msg.channel.send(`Source: <${source}>\nResults: ${results}`);
        }
        else {
            msg.channel.send('Aww there\'s no results 😢');
        }
    }
}

/**
 * Returns an image, a source url, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getImage(tagArr) {
    // whitespace is replaced with '+'
    // tags are separated by '%2C'
    const tags = [
        ...new Set(
            tagArr
            .join(derp.whitespace)
            .split(tagSeparator)
            .map(t => stringUtil.trim(t, derp.whitespace))
            )
        ]
        .join(derp.separator);
    
    let imgURL = '';
    let source = '';
    let results = 0;

    if (tags !== '') {
        const searchURL = `${URL}${tags}`;

        try {
            let response = await axios.get(searchURL);
            const count = parseInt(response.data.total);

            if (count) {
                const pageNum = rand.randomMath(1, count + 1);

                response = await axios.get(`${searchURL}&page=${pageNum}`);

                const img = response.data.images[0];

                imgURL = img.representations.full;
                source = `${derp.URL}${img.id}`;
                results = count;
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

//----------------------------------------------------------------

/**
 * Returns an image, a source url, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getImage50(tagArr) {
    // whitespace is replaced with '+'
    // tags are separated by '%2C'
    const tags =
        [
        ...new Set(
            tagArr
            .join(derp.whitespace)
            .split(tagSeparator)
            .map(t => stringUtil.trim(t, derp.whitespace))
            )
        ]
        .join(derp.separator);
    
    let imgURL = '';
    let source = '';
    let results = 0;

    if (tags !== '') {
        const searchURL = `${URL50}${tags}`;

        try {
            let response = await axios.get(searchURL);
            const count = parseInt(response.data.total);

            if (count) {
                // limit of 50 results per page
                let maxPages = ~~(count / 50);

                if (count % 50) {
                    maxPages++;
                }

                // page number starts at 1
                const pageNum = rand.randomMath(1, maxPages + 1);

                response = await axios.get(`${searchURL}&page=${pageNum}`);

                const imgArr = response.data.images;

                const img = imgArr[rand.randomMath(imgArr.length)];

                imgURL = img.representations.full;
                source = `${derp.URL}${img.id}`;
                results = count;
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