import config from '../../config/config.json' assert { type: 'json' };
import PQueue from 'p-queue';
import {
    backOff,
    replaceHTMLEntities
} from '../lib/urlUtils.js';

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
        const response = await fetch(fifty.URL);

        if (backOff(response, queue)) {
            return;
        }

        const post = (await response.json())[0].data.children[0].data;

        title = post.title;
        link = replaceHTMLEntities(post.url);
    });

    return {
        title,
        link
    }
}
