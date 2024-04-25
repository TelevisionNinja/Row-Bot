import config from '../../config/config.json' with { type: 'json' };
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { decodeHTML } from 'entities';
import { default as nodeFetch } from 'node-fetch';
import { randomInteger } from '../lib/randomFunctions.js';

const fifty = config.fifty;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

export default {
    interactionData: {
        name: fifty.names[0],
        description: fifty.description,
        options: []
    },
    names: fifty.names,
    description: fifty.description,
    argsRequired: false,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '',
    cooldown: 1,
    async execute(msg, args) {
        const {
            title,
            link
        } = await getRandomFifty();

        msg.reply(`${title}\n<${link}>`);
    },
    async executeInteraction(interaction) {
        const fiftyResult = getRandomFifty();

        await interaction.deferReply();

        const {
            title,
            link
        } = await fiftyResult;

        interaction.editReply(`${title}\n<${link}>`);
    }
}

export async function getRandomFifty() {
    let title = '';
    let link = '';

    await queue.add(async () => {
        const response = await nodeFetch(fifty.URL, {
            headers: {
                'User-Agent': config.userAgents[randomInteger(config.userAgents.length)] // reddit api requires a user agent. some are blocked thus the user of browser user agents
            }
        });

        if (backOff(response, queue)) {
            return;
        }

        const post = (await response.json())[0].data.children[0].data;

        title = post.title;
        link = decodeHTML(post.url);
    });

    return {
        title,
        link
    };
}
