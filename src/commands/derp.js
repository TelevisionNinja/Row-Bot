import config from '../../config/config.json' with { type: 'json' };
import { createImgResult } from '../lib/msgUtils.js';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { ApplicationCommandOptionType } from 'discord.js';

const derp = config.derp,
    tagSeparator = config.tagSeparator;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const URL = `${derp.API}${derp.APIKey}&q=`;

export default {
    interactionData: {
        name: derp.names[0],
        description: derp.description,
        options: [
            {
                name: 'tags',
                description: 'The tags to search for',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: derp.names,
    description: derp.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator);

        const img = await getImage(args);

        msg.reply(createImgResult(img));
    },
    async executeInteraction(interaction) {
        const tags = interaction.options.getString('tags').split(tagSeparator);
        const img = getImage(tags);

        await interaction.deferReply();

        interaction.editReply(createImgResult(await img));
    }
}

/**
 * Returns an image object
 * If no image is found, the results var is zero
 * To search artists' images, type `artist:<artist name>` as a tag
 * Search `explicit` for nsfw images. Search `safe` for sfw images
 * Put a '-' infront of tags you want to exclude
 * 
 * @param {*} tagArr array of tags to be searched
 * @returns 
 */
export async function getImage(tagArr) {
    // tags are separated by ','
    // '-' infront of a tag means to exclude it
    const tags = encodeURIComponent(tagArr.join(derp.separator));
    let imgObj = { results: 0 };

    await queue.add(async () => {
        try { // possible bot check response received
            const response = await fetch(`${URL}${tags}`);

            if (backOff(response, queue)) {
                return;
            }

            const body = await response.json();
            const results = parseInt(body.total, 10);

            if (results) {
                const img = body.images[0];

                //-----------------------------------------
                // create image object

                let artists = [];

                for (let i = 0, n = img.tags.length; i < n; i++) {
                    const tag = img.tags[i];

                    if (tag.startsWith('artist:')) {
                        artists.push(tag.substring(7));
                    }
                }

                if (!artists.length) {
                    artists.push('unknown artist');
                }

                imgObj = {
                    source: `${derp.URL}${img.id}`,
                    url: img.representations.full,
                    artist: artists,
                    description: img.description,
                    results: results,
                    title: '',
                    website: derp.websiteName,
                    embedColor: derp.embedColor
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    });

    return imgObj;
}
