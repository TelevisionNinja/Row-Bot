const {
    derpAliases,
    derpAPIURL,
    derpURL
} = require('../config.json');
const rand = require('../lib/randomFunctions.js');
const axios = require('axios');

module.exports = {
    name: 'derp',
    aliases: derpAliases,
    fileName: __filename,
    description: 'Send derp images. To search artists\' images, type `artist:<artist name>`',
    args: true,
    guildOnly: false,
    usage: '<tags separated by commas>',
    cooldown: 1,
    async execute(msg, args) {
        const searchTerms = args.join('+').split(',').map(t => t.replace(/^\++|\++$/g, '')).join('%2C');
        const url = `${derpAPIURL}${searchTerms}`;

        try {
            let response = await axios.get(url);
            const count = parseInt(response.data.total);

            if (!count) {
                msg.channel.send('Aww there\'s no results 😢');
                return;
            }

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

            msg.channel.send(`${derpURL}${img.id}`);
            msg.channel.send(`Results: ${count}`);
        }
        catch (error) {
            console.log(error);
        }
    }
}