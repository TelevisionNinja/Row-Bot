import { default as config } from '../config.json';
import { randomMath } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';
import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { Constants } from 'discord.js';

const urban = config.urban,
    noResultsMsg = config.noResultsMsg;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

export default {
    interactionData: {
        name: urban.names[0],
        description: urban.description,
        options: [
            {
                name: 'search',
                description: 'What term to search',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: urban.names,
    description: urban.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<search term>',
    cooldown: 1,
    execute(msg, args) {
        const URL = `${urban.API}${encodeURIComponent(args.join(' '))}`;

        queue.add(async () => {
            const response = await fetch(URL);

            if (backOff(response, queue)) {
                msg.channel.send(noResultsMsg);
                return;
            }

            const defs = (await response.json()).list;
            const count = defs.length;

            if (count) {
                const result = defs[randomMath(count)];
                const definition = result.definition.replaceAll(/[\[\]]/g, '');
                let example = 'No example was provided.';

                if (result.example.length) {
                    example = cutOff(result.example.replaceAll(/[\[\]]/g, ''), 1024);
                }

                msg.channel.send({
                    embeds: [{
                        title: result.word,
                        url: result.permalink,
                        fields: [
                            {
                                name: 'Definition',
                                value: cutOff(definition, 1024)
                            },
                            {
                                name: 'Example',
                                value: example
                            },
                            {
                                name: 'Rating',
                                value: `👍 ${result.thumbs_up}\t👎 ${result.thumbs_down}`
                            },
                            {
                                name: 'Results',
                                value: `${count}`
                            }
                        ]
                    }]
                });
            }
            else {
                msg.channel.send(noResultsMsg);
            }
        });
    },
    async executeInteraction(interaction) {
        await interaction.deferReply();

        const URL = `${urban.API}${encodeURIComponent(interaction.options.getString('search'))}`;

        queue.add(async () => {
            const response = await fetch(URL);

            if (backOff(response, queue)) {
                interaction.editReply(noResultsMsg);
                return;
            }

            const defs = (await response.json()).list;
            const count = defs.length;

            if (count) {
                const result = defs[randomMath(count)];
                const definition = result.definition.replaceAll(/[\[\]]/g, '');
                let example = 'No example was provided.';

                if (result.example.length) {
                    example = cutOff(result.example.replaceAll(/[\[\]]/g, ''), 1024);
                }

                interaction.editReply({
                    embeds: [{
                        title: result.word,
                        url: result.permalink,
                        fields: [
                            {
                                name: 'Definition',
                                value: cutOff(definition, 1024)
                            },
                            {
                                name: 'Example',
                                value: example
                            },
                            {
                                name: 'Rating',
                                value: `👍 ${result.thumbs_up}\t👎 ${result.thumbs_down}`
                            },
                            {
                                name: 'Results',
                                value: `${count}`
                            }
                        ]
                    }]
                });
            }
            else {
                interaction.editReply(noResultsMsg);
            }
        });
    }
}
