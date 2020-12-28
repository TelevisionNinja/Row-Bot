const {
    derpAliases,
    derpAPIKey,
    derpAPI,
    derpAPI50,
    derpURL
} = require('../config.json');
const rand = require('../lib/randomFunctions.js');
const axios = require('axios');

module.exports = {
    name: 'derp',
    aliases: derpAliases,
    fileName: __filename,
    description: 'Returns a derp image. To search artists\' images, type `artist:<artist name>` as a tag',
    args: true,
    guildOnly: false,
    usage: '<tags separated by commas>',
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
    const searchTerms = [...new Set(tagArr.join('+').split(',').map(t => t.replace(/^\++|\++$/g, '')))].join('%2C');
    
    let imgURL = '';
    let source = '';
    let results = 0;

    if (searchTerms !== '') {
        const url = `${derpAPI}${derpAPIKey}&q=${searchTerms}`;

        try {
            let response = await axios.get(url);
            const count = parseInt(response.data.total);

            if (count) {
                const pageNum = rand.randomMath(1, count + 1);

                response = await axios.get(`${url}&page=${pageNum}`);

                const img = response.data.images[0];

                imgURL = img.representations.full;
                source = `${derpURL}${img.id}`;
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

/**
 * Returns an image, a source url, and the number of results.
 * If no image is found, the results var is returned as zero.
 * 
 * @param {*} tagArr array of tags to be searched
 */
async function getImage50(tagArr) {
    const searchTerms = [...new Set(tagArr.join('+').split(',').map(t => t.replace(/^\++|\++$/g, '')))].join('%2C');
    
    let imgURL = '';
    let source = '';
    let results = 0;

    if (searchTerms !== '') {
        const url = `${derpAPI50}${derpAPIKey}&q=${searchTerms}`;

        try {
            let response = await axios.get(url);
            const count = parseInt(response.data.total);

            if (count) {
                // limit of 50 results per page
                let maxPages = ~~(count / 50);

                if (count % 50) {
                    maxPages++;
                }

                // page number starts at 1
                const pageNum = rand.randomMath(1, maxPages + 1);

                response = await axios.get(`${url}&page=${pageNum}&per_page=50`);

                const imgArr = response.data.images;

                const img = imgArr[rand.randomMath(imgArr.length)];

                imgURL = img.representations.full;
                source = `${derpURL}${img.id}`;
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