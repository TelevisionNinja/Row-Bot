import config from '../../config/config.json' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';
import { cutOff } from '../lib/stringUtils.js';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';

const tts = config.tts,
    tagSeparator = config.tagSeparator;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const punctuation = new Set([
    '.',
    ',',
    ':',
    '!',
    '?'
]);

const errorMsg = 'Text must be at least 5 characters, and a valid character must be provided';

export default {
    interactionData: {
        name: tts.names[0],
        description: tts.description,
        options: [
            {
                name: 'character',
                description: 'The character to speak',
                required: true,
                type: ApplicationCommandOptionType.String
            },
            {
                name: 'text',
                description: 'The text to say',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: tts.names,
    description: tts.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: `<character>${tagSeparator} <text>`,
    cooldown: 1,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator);

        const character = args.shift().trim();
        const text = args.join(tagSeparator).trimStart();
        const url = await getTtsUrl(character, text);

        if (!character.length || !text.length) {
            msg.reply('Please provide a character and text');
            return;
        }

        if (url.length) {
            msg.reply({ files: [url] });
        }
        else {
            msg.reply(errorMsg);
        }
    },
    async executeInteraction(interaction) {
        const character = interaction.options.getString('character');
        const text = interaction.options.getString('text');
        let url = getTtsUrl(character, text);

        await interaction.deferReply();

        url = await url;

        if (url.length) {
            interaction.editReply({ files: [url] });
        }
        else {
            interaction.editReply(errorMsg);
        }
    }
}

function filterText(text) {
    if (text.length < 5) {
        return '';
    }

    const filteredText = cutOff(text.trim(), 200);
    const lastChar = filteredText[filteredText.length - 1];

    if (filteredText.length < 200 && !punctuation.has(lastChar)) {
        return `${filteredText}.`;
    }

    return filteredText;
}

/**
 * 
 * @param {*} character 
 * @param {*} text 
 * @param {*} emotion 
 * @returns a url
 */
export async function getTtsUrl(character, text, emotion = 'Contextual') {
    text = filterText(text);
    let url = '';

    if (!text.length) {
        return url;
    }

    await queue.add(async () => {
        //----------------------------
        // get response

        const response = await fetch(`https://api.15.ai/app/getAudioFile5`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                character: character,
                emotion: emotion
            })
        });

        if (backOff(response, queue)) {
            return;
        }

        const body = await response.json();

        // if the post request errors, a message is returned
        if (typeof body.message !== 'undefined') {
            return;
        }

        const fileName = body.wavNames[0];

        url = `https://cdn.15.ai/audio/${fileName}`;
    });

    return url;
}

/**
 * 
 * @param {*} url url from getTtsUrl()
 * @returns stream
 */
export async function getTtsStream(url) {
    let stream = undefined;

    if (!url.length) {
        return stream;
    }

    await queue.add(async () => {
        //----------------------------
        // get response

        const response = await fetch(url);

        if (backOff(response, queue)) {
            return;
        }

        stream = (await response.blob()).stream();
    });

    return stream;
}
