const {
    urban,
    noResultsMsg
} = require('../config.json');
const rand = require('../lib/randomFunctions.js');
const stringUtils = require('../lib/stringUtils.js');
const querystring = require('querystring');
const axios = require('axios');
const Discord = require('discord.js');
const {
    RateLimiterMemory,
    RateLimiterQueue
} = require('rate-limiter-flexible');

const limit = new RateLimiterMemory({
    points: 10,
    duration: 1
});
const rateLimiter = new RateLimiterQueue(limit);

module.exports = {
    names: urban.names,
    description: urban.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<search term>',
    cooldown: 1,
    async execute(msg, args) {
        await rateLimiter.removeTokens(1);

        const searchWord = querystring.stringify({ term: args.join(' ') });
        const URL = `${urban.API}${searchWord}`;

        try {
            const response = await axios.get(URL);
            const defs = response.data.list;
            const count = defs.length;

            if (count) {
                const result = defs[rand.randomMath(count)];

                const definition = result.definition.replaceAll(/[\[\]]/g, '');
                const example = result.example.replaceAll(/[\[\]]/g, '');

                const embed = new Discord.MessageEmbed()
                    .setTitle(result.word)
                    .setURL(result.permalink)
                    .addFields(
                        {
                            name: 'Definition',
                            value: stringUtils.cutOff(definition, 1024)
                        },
                        {
                            name: 'Example',
                            value: stringUtils.cutOff(example, 1024)
                        },
                        {
                            name: 'Rating',
                            value: `👍 ${result.thumbs_up}\t👎 ${result.thumbs_down}`
                        },
                        {
                            name: 'Results',
                            value: count
                        }
                    );

                msg.channel.send(embed);
            }
            else {
                msg.channel.send(noResultsMsg);
            }
        }
        catch (error) {
            msg.channel.send(noResultsMsg);
        }
    }
}