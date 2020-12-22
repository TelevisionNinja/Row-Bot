const { tenorAPIKey } = require('../config.json');
const rand = require('../lib/randomFunc');
const axios = require('axios');

module.exports = {
    name: 'gif',
    fileName: __filename,
    description: 'sends gifs',
    args: true,
    usage: '<search terms>',
    cooldown: 1,
    async execute(msg, args) {
        const searchTerms = args.join(' ');
        const url = `https://api.tenor.com/v1/search?q=${searchTerms}&key=${tenorAPIKey}`;

        try {
            const response = await axios.get(url);
            const gifArr = response.data.results;

            if (gifArr.length) {
                msg.channel.send(gifArr[rand.randomInt(gifArr.length)].url);
            }
            else {
                msg.channel.send('Aww there\'s no results 😢');
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}