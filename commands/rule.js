import { randomMath } from '../lib/randomFunctions.js';
import {
    sendImg,
    sendImgInteraction
} from '../lib/msgUtils.js';
import { tagArrToParsedTagArr } from '../lib/stringUtils.js';
import fetch from 'node-fetch';
import { parse } from 'txml';
import { default as config } from '../config.json';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { Constants } from 'discord.js';

const rule = config.rule,
    tagSeparator = config.tagSeparator;

const queueZero = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const queueOne = new PQueue({
    interval: 1000,
    intervalCap: 50
});

export default {
    interactionData: {
        name: rule.names[0],
        description: rule.description,
        options: [
            {
                name: 'tags',
                description: 'The tags to search for',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: rule.names,
    description: rule.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: `<tags separated by a "${tagSeparator}">`,
    cooldown: 1,
    async execute(msg, args) {
        args = args.join(' ').split(tagSeparator);

        const img = await getImage(args);

        sendImg(msg.channel, img);
    },
    async executeInteraction(interaction) {
        await interaction.deferReply();

        const tags = interaction.options.getString('tags').split(tagSeparator);
        const img = await getImage(tags);

        sendImgInteraction(interaction, img);
    }
}

/**
 * Returns an image object
 * If no image is found, the results var is zero
 * 
 * 2 requests are made
 * 
 * @param {*} tagArr array of tags that are already formatted
 * @returns 
 */
export async function getImageRule0(tagArr) {
    // tags are separated by '+'
    const URL = `${rule.sites[0].API}${tagArr.join(rule.sites[0].separator)}&limit=`;
    let imgObj = { results: 0 };

    await queueZero.add(async () => {
        let response = await fetch(`${URL}0`);

        if (backOff(response, queueZero)) {
            return;
        }

        let parsedXML = parse(await response.text());

        // 'count' is # of images for the provided tags
        let count = parseInt(parsedXML[1].attributes.count);

        if (count) {
            imgObj.results = count;

            // the max number of images for the rule0 api is 200001 images (0-200000)
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
            if (count > 200000) {
                count = 200000;
            }

            const pid = randomMath(count);

            response = await fetch(`${URL}1&pid=${pid}`);

            if (backOff(response, queueZero)) {
                return;
            }

            parsedXML = parse(await response.text());

            // get the first image from the 'posts' array
            // elements of the array are named 'post'
            const img = parsedXML[1].children[0].attributes;

            imgObj.source = `${rule.sites[0].URL}${img.id}`;
            imgObj.url = img.file_url;
            imgObj.artist = [];
            imgObj.description = '';
            imgObj.title = '';
            imgObj.website = rule.websiteName;
            imgObj.embedColor = rule.embedColor;
        }
    });

    return imgObj;
}

/**
 * Returns an image object
 * If no image is found, the results var is zero
 * 
 * 2 requests are made
 * 
 * @param {*} tagArr array of tags that are already formatted
 * @returns 
 */
export async function getImageRule1(tagArr) {
    // this api has a max of 3 tags
    if (tagArr.length > 3) {
        tagArr = tagArr.slice(0, 3);
    }

    // tags are separated by ' '
    const URL = `${rule.sites[1].API}${tagArr.join(encodeURIComponent(rule.sites[1].separator))}&limit=`;
    let imgObj = { results: 0 };

    await queueOne.add(async () => {
        let response = await fetch(`${URL}0`);

        if (backOff(response, queueOne)) {
            return;
        }

        let parsedXML = parse(await response.text());

        // 'count' is # of images for the provided tags
        const count = parseInt(parsedXML[0].attributes.count);

        if (count) {
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
            const pid = randomMath(count);

            response = await fetch(`${URL}1&pid=${pid}`);

            if (backOff(response, queueOne)) {
                return;
            }

            parsedXML = parse(await response.text());

            // get the first image from the 'posts' array
            // elements of the array are named 'tag'
            const img = parsedXML[0].children[0].attributes;

            imgObj.source = `${rule.sites[1].URL}${img.id}`;
            imgObj.url = img.file_url;
            imgObj.results = count;
            imgObj.artist = [];
            imgObj.description = '';
            imgObj.title = '';
            imgObj.website = rule.websiteName;
            imgObj.embedColor = rule.embedColor;
        }
    });

    return imgObj;
}

/**
 * Returns an image object from one of the rule sites
 * If no image is found, the count var is zero
 * Put a '-' infront of tags you want to exclude
 * 
 * @param {*} tagArr array of tags to be searched
 * @returns 
 */
export async function getImage(tagArr) {
    // whitespace is replaced with '_'
    // '-' infront of a tag means to exclude it
    tagArr = tagArrToParsedTagArr(tagArr, rule.sites[0].whitespace);

    const numOfSites = rule.sites.length;
    const randomSiteID = randomMath(numOfSites);
    let requestedImg;

    if (randomSiteID) {
        requestedImg = await getImageRule1(tagArr);
    }
    else {
        requestedImg = await getImageRule0(tagArr);
    }

    if (!requestedImg.results) {
        // cycle through the sites
        if ((randomSiteID + 1) % numOfSites) {
            requestedImg = await getImageRule1(tagArr);
        }
        else {
            requestedImg = await getImageRule0(tagArr);
        }
    }

    return requestedImg;
}
