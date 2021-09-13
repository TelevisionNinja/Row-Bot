import { default as config } from '../config.json';
import axios from 'axios';
import { replaceHTMLEntities } from '../lib/stringUtils.js';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

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

        msg.channel.send(`${title}\n<${link}>`);
    },
    async executeInteraction(interaction) {
        await interaction.deferReply();

        const {
            title,
            link
        } = await getRandomFifty();

        interaction.editReply(`${title}\n<${link}>`);
    }
}

export async function getRandomFifty() {
    let title = '';
    let link = '';

    await queue.add(async () => {
        try {
            const response = await axios.get(fifty.URL);
            const post = response.data[0].data.children[0].data;

            title = post.title;
            link = replaceHTMLEntities(post.url);
        }
        catch (error) {
            backOff(error, queue);
        }
    });

    return {
        title,
        link
    }
}
