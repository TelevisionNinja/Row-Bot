import { default as config } from '../config.json';
import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { Constants } from 'discord.js';

const tenor = config.tenor,
    noResultsMsg = config.noResultsMsg;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const URL = `${tenor.API}${tenor.APIKey}&q=`;

export default {
    interactionData: {
        name: tenor.names[0],
        description: tenor.description,
        options: [
            {
                name: 'search',
                description: 'What to search gifs for',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: tenor.names,
    description: tenor.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<search terms separated by a space>',
    cooldown: 1,
    async execute(msg, args) {
        const {
            gif,
            hasResult
        } = await getGif(args.join(' '));

        if (hasResult) {
            msg.channel.send(gif);
        }
        else {
            msg.channel.send(noResultsMsg);
        }
    },
    async executeInteraction(interaction) {
        await interaction.deferReply();

        const {
            gif,
            hasResult
        } = await getGif(interaction.options.getString('search'));

        if (hasResult) {
            interaction.editReply(gif);
        }
        else {
            interaction.editReply(noResultsMsg);
        }
    }
}

/**
 * Returns a gif and a boolean for whether of not there's a result.
 * If no gif is found, the hasResult var is returned as false.
 * 
 * @param {*} searchTerm term to be searched
 */
export async function getGif(searchTerm) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    let gif = '';
    let hasResult = false;

    await queue.add(async () => {
        const response = await fetch(`${URL}${encodedSearchTerm}`);

        if (backOff(response, queue)) {
            return;
        }

        const gifArr = (await response.json()).results;

        if (gifArr.length) {
            gif = gifArr[0].url;
            hasResult = true;
        }
    });

    return {
        gif,
        hasResult
    };
}
