import config from '../../config/config.json' assert { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';
import { cutOff } from '../lib/stringUtils.js';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { ApplicationCommandOptionType } from 'discord.js';

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
                type: ApplicationCommandOptionType.String
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
    async execute(msg, args) {
        const {
            definition,
            results
        } = await getDefinition(args.join(' '));

        if (typeof definition === 'undefined') {
            msg.reply(noResultsMsg);
            return;
        }

        const definitionStr = definition.definition.replaceAll(/[\[\]]/g, '');
        let example = 'No example was provided.';

        if (definition.example.length) {
            example = cutOff(definition.example.replaceAll(/[\[\]]/g, ''), 1024);
        }

        msg.reply({
            embeds: [{
                title: definition.word,
                url: definition.permalink,
                fields: [
                    {
                        name: 'Definition',
                        value: cutOff(definitionStr, 1024)
                    },
                    {
                        name: 'Example',
                        value: example
                    },
                    {
                        name: 'Rating',
                        value: `👍 ${definition.thumbs_up}\t👎 ${definition.thumbs_down}`
                    },
                    {
                        name: 'Results',
                        value: `${results}`
                    }
                ]
            }]
        });
    },
    async executeInteraction(interaction) {
        const definitionResult = getDefinition(interaction.options.getString('search'));

        await interaction.deferReply();

        const {
            definition,
            results
        } = await definitionResult;

        if (typeof definition === 'undefined') {
            interaction.editReply(noResultsMsg);
            return;
        }

        const definitionStr = definition.definition.replaceAll(/[\[\]]/g, '');
        let example = 'No example was provided.';

        if (definition.example.length) {
            example = cutOff(definition.example.replaceAll(/[\[\]]/g, ''), 1024);
        }

        interaction.editReply({
            embeds: [{
                title: definition.word,
                url: definition.permalink,
                fields: [
                    {
                        name: 'Definition',
                        value: cutOff(definitionStr, 1024)
                    },
                    {
                        name: 'Example',
                        value: example
                    },
                    {
                        name: 'Rating',
                        value: `👍 ${definition.thumbs_up}\t👎 ${definition.thumbs_down}`
                    },
                    {
                        name: 'Results',
                        value: `${results}`
                    }
                ]
            }]
        });
    }
}

export async function getDefinition(term) {
    let definition = undefined;
    let results = 0;
    const URL = `${urban.API}${encodeURIComponent(term)}`;

    await queue.add(async () => {
        const response = await fetch(URL);

        if (backOff(response, queue)) {
            return;
        }

        const defs = (await response.json()).list;
        results = defs.length;

        if (results) {
            definition = defs[randomInteger(results)];
        }
    });

    return {
        definition,
        results
    };
}
