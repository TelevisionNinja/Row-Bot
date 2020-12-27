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
        const searchTerms = args.join(' ');
        const url = `https://api.tenor.com/v1/search?q=${searchTerms}&key=${tenorAPIKey}&limit=50&media_filter=minimal`;

        try {
            const response = await axios.get(url);
            const gifArr = response.data.results;

            if (gifArr.length) {
                msg.channel.send(gifArr[rand.randomMath(gifArr.length)].url);
            }
            else {
                msg.channel.send('Aww there\'s no results 😢');
            }
        }
        catch (error) {
            msg.channel.send('I couldn\'t get any results');
            console.log(error);
        }
    }
}