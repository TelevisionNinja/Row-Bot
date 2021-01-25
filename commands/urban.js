const { urban } = require('../config.json');
const rand = require('../lib/randomFunctions.js');
const stringUtils = require('../lib/stringUtils.js');
const querystring = require('querystring');
const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
    names: urban.names,
    description: urban.description,
    args: true,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<word>',
    cooldown: 1,
    async execute(msg, args) {
        const searchWord = querystring.stringify({ term: args.join(' ') });
        const URL = `${urban.API}${searchWord}`;

        try {
            const response = await axios.get(URL);
            const defs = response.data.list;

            if (defs.length) {
                const result = defs[rand.randomMath(defs.length)];

                const embed = new Discord.MessageEmbed()
                    .setTitle(result.word)
                    .setURL(result.permalink)
                    .addFields(
                        {
                            name: 'Definition',
                            value: stringUtils.cutOff(result.definition, 1024)
                        },
                        {
                            name: 'Example',
                            value: stringUtils.cutOff(result.example, 1024)
                        },
                        {
                            name: 'Rating',
                            value: `👍 ${result.thumbs_up}\t👎 ${result.thumbs_down}`
                        }
                    );

                msg.channel.send(embed);
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