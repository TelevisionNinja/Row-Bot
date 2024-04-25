import config from '../../config/config.json' with { type: 'json' };
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { ApplicationCommandOptionType } from 'discord.js';

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
                type: ApplicationCommandOptionType.String
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
            msg.reply(gif);
        }
        else {
            msg.reply(noResultsMsg);
        }
    },
    async executeInteraction(interaction) {
        const gifResult = getGif(interaction.options.getString('search'));

        await interaction.deferReply();

        const {
            gif,
            hasResult
        } = await gifResult;

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
