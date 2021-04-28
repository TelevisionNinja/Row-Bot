import { default as config } from '../config.json';
import { randomMath } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';
import { stringify } from 'querystring';
import axios from 'axios';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const urban = config.urban,
    noResultsMsg = config.noResultsMsg;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 10
});

export default {
    names: urban.names,
    description: urban.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<search term>',
    cooldown: 1,
    async execute(msg, args) {
        const searchWord = stringify({ term: args.join(' ') });
        const URL = `${urban.API}${searchWord}`;

        await queue.add(async () => {
            try {
                const response = await axios.get(URL);
                const defs = response.data.list;
                const count = defs.length;

                if (count) {
                    const result = defs[randomMath(count)];
                    const definition = result.definition.replaceAll(/[\[\]]/g, '');
                    const example = result.example.replaceAll(/[\[\]]/g, '');

                    msg.channel.send({
                        embed: {
                            title: result.word,
                            url: result.permalink,
                            fields: [
                                {
                                    name: 'Definition',
                                    value: cutOff(definition, 1024)
                                },
                                {
                                    name: 'Example',
                                    value: cutOff(example, 1024)
                                },
                                {
                                    name: 'Rating',
                                    value: `👍 ${result.thumbs_up}\t👎 ${result.thumbs_down}`
                                },
                                {
                                    name: 'Results',
                                    value: count
                                }
                            ]
                        }
                    });
                }
                else {
                    msg.channel.send(noResultsMsg);
                }
            }
            catch (error) {
                backOff(error, queue);
                msg.channel.send(noResultsMsg);
            }
        });
    }
}