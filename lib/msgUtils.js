import config from '../config.json' assert { type: 'json' };
import { isValidURL } from './urlUtils.js';
import { cutOff } from './stringUtils.js';
import { WebhookClient } from 'discord.js';
import { default as tulpCache } from './tulpCache.js';
import { webhooks } from './database.js';

/**
 * wpm to ms per char derivation
 * 
 * ---------------------------
 * words per min to chars per ms
 * 
 * x = number of words
 * a = average chars per word
 * 
 * (x words)/(1 min) * (a chars)/(1 word) * (1 min)/(60 s) * (1 s)/(10^3 ms)
 * 
 * = (x * a chars) / (60 * 10^3 ms)
 * = (x * a chars) / (6 * 10^4 ms)
 * 
 * --------------------------
 * simplification
 * 
 * a = 6 // 6 is chosen to cancel out the 6 in the denominator for a simple approximation, and it is roughly about the average english word length
 * 
 * xa/(6*10^4)
 * = x/(10^4)
 * 
 * ---------------------------
 * convert to ms per char
 * 
 * (x/(10^4))^-1
 * = (10^4)/x
 * 
 * @param {*} wpm 
 * @returns 
 */
function wpmToMspchar(wpm) {
    return 10000 / wpm;
}

const readingSpeed = wpmToMspchar(config.readingSpeed),
    typingSpeed = wpmToMspchar(config.typingSpeed),
    reactionSpeed = config.reactionSpeed, // this is ms
    clientID = config.clientID,
    noResultsMsg = config.noResultsMsg,
    tagSeparator = config.tagSeparator,
    rule = config.rule;

/**
 * sends an image query result
 * 
 * @param {*} channel 
 * @param {*} img image object
 * @param {*} sendResults bool to send results with the image
 */
export function sendImg(channel, img, sendResults = true) {
    if (img.results) {
        const extension = img.url.substring(img.url.lastIndexOf('.') + 1).toLowerCase();

        if (extension === 'webm' || extension === 'mp4') {
            let infoText = 'Source: ';

            if (img.website === rule.websiteName) {
                img.source = `<${img.source}>`;
                infoText = `${img.url}\n${infoText}`;
            }

            infoText = `${infoText}${img.source}`;

            if (sendResults) {
                infoText = `${infoText}\nResults: ${img.results}`;
            }

            channel.send(infoText);
        }
        else {
            let embedObj = {
                fields: [],
                url: img.source,
                color: parseInt(img.embedColor, 16),
                image: {
                    url: img.url
                },
                title: 'Source'
            };

            if (img.title.length) {
                embedObj.author = { name: img.title };
            }

            if (img.description.length) {
                embedObj.fields.push(
                    {
                        name: 'Description',
                        value: cutOff(img.description, 1024)
                    }
                );
            }

            if (img.artist.length) {
                embedObj.fields.push(
                    {
                        name: img.artist.length === 1 ? 'Artist' : 'Artists',
                        value: cutOff(img.artist.join(', '), 1024)
                    }
                );
            }

            if (sendResults) {
                embedObj.footer = { text: `Results: ${img.results}` };
            }

            channel.send({ embeds: [embedObj] });
        }
    }
    else {
        channel.send(noResultsMsg);
    }
}

/**
 * sends an image query result
 * 
 * @param {*} interaction 
 * @param {*} img image object
 * @param {*} sendResults bool to send results with the image
 */
export function sendImgInteraction(interaction, img, sendResults = true) {
    if (img.results) {
        const extension = img.url.substring(img.url.lastIndexOf('.') + 1).toLowerCase();

        if (extension === 'webm' || extension === 'mp4') {
            let infoText = 'Source: ';

            if (img.website === rule.websiteName) {
                img.source = `<${img.source}>`;
                infoText = `${img.url}\n${infoText}`;
            }

            infoText = `${infoText}${img.source}`;

            if (sendResults) {
                infoText = `${infoText}\nResults: ${img.results}`;
            }

            interaction.editReply(infoText);
        }
        else {
            let embedObj = {
                fields: [],
                url: img.source,
                color: parseInt(img.embedColor, 16),
                image: {
                    url: img.url
                },
                title: 'Source'
            };

            if (img.title.length) {
                embedObj.author = { name: img.title };
            }

            if (img.description.length) {
                embedObj.fields.push(
                    {
                        name: 'Description',
                        value: cutOff(img.description, 1024)
                    }
                );
            }

            if (img.artist.length) {
                embedObj.fields.push(
                    {
                        name: img.artist.length === 1 ? 'Artist' : 'Artists',
                        value: cutOff(img.artist.join(', '), 1024)
                    }
                );
            }

            if (sendResults) {
                embedObj.footer = { text: `Results: ${img.results}` };
            }

            interaction.editReply({ embeds: [embedObj] });
        }
    }
    else {
        interaction.editReply(noResultsMsg);
    }
}

/**
 * starts typing and then sends a message
 * 
 * @param {*} channel 
 * @param {*} sendingMsg 
 * @param {*} readingMsg 
 * @returns 
 */
export function sendTypingMsg(channel, sendingMsg, readingMsg = '') {
    let typingTime = sendingMsg.length * typingSpeed + reactionSpeed;
    let readingTime = readingMsg.length * readingSpeed + reactionSpeed;

    // limit of 30 seconds
    if (typingTime > 30000) {
        typingTime = 30000;
    }

    if (readingTime > 30000) {
        readingTime = 30000;
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            channel.sendTyping();

            setTimeout(async () => {
                try {
                    resolve(await channel.send(sendingMsg));
                }
                catch (error) {
                    reject(error);
                }
            }, typingTime); // time before sending
        }, readingTime) // time before typing
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} id channel id
 * @returns 
 */
export async function getChannel(client, id) {
    const recipient = client.channels.cache.get(id);

    if (typeof recipient === 'undefined') {
        return await client.channels.fetch(id);
    }

    return recipient;
}

/**
 * 
 * @param {*} client 
 * @param {*} id user id
 * @returns 
 */
export async function getDMChannel(client, id) {
    const recipient = client.users.cache.get(id);

    if (typeof recipient === 'undefined') {
        return (await client.users.fetch(id)).createDM();
    }

    return recipient.createDM();
}

/**
 * Sends a message to the author's DM's.
 * 
 * @param {*} msg discord js Message obj
 * @param {*} content message to be sent through DM's
 * @returns 
 */
export async function sendAuthorDm(msg, content) {
    try {
        await msg.author.send(content);

        if (msg.channel.type === 'DM') {
            return;
        }

        msg.reply('I\'ve sent you a DM');
    }
    catch (error) {
        console.log(error);
        msg.reply('I couldn\'t DM you 😢');
    }
}

/**
 * Sends a message to someone's DM's.
 * 
 * @param {*} channel channel
 * @param {*} msg message to be sent through DM's
 * @param {*} sendTyping send a typing message or not, default value is false
 * @param {*} readingMsg message to read before typing, default value is an empty string
 */
export async function sendDirectDm(channel, msg, sendTyping = false, readingMsg = '') {
    if (sendTyping) {
        const dm = await channel.createDM();

        sendTypingMsg(dm, msg, readingMsg);
    }
    else {
        channel.send(msg);
    }
}

/**
 * if the bot itself or one of its roles is mentioned, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the channel, default is true
 * @param {*} users check for mentions of users in the channel, default is true
 * @param {*} roles check for mentions of roles in the channel, default is true
 * @returns 
 */
export function hasBotMention(msg, everyone = true, users = true, roles = true) {
    if (everyone && msg.mentions.everyone) {
        return true;
    }

    if (users && msg.mentions.users.has(clientID)) {
        return true;
    }

    if (roles) {
        // iterate over the smaller array
        if (msg.mentions.roles.size > msg.guild.me.roles.cache.size) {
            const roleArr = [...msg.guild.me.roles.cache.values()].map(r => r.id);

            if (roleArr.some(r => msg.mentions.roles.has(r))) {
                return true;
            }
        }
        else {
            const roleArr = [...msg.mentions.roles.values()].map(r => r.id);

            if (roleArr.some(r => msg.guild.me.roles.cache.has(r))) {
                return true;
            }
        }
    }

    return false;
}

/**
 * if there are any of the specified mentions, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the channel, default is true
 * @param {*} users check for mentions of users in the channel, default is true
 * @param {*} roles check for mentions of roles in the channel, default is true
 * @returns 
 */
export function hasMentions(msg, everyone = true, users = true, roles = true) {
    if (everyone && msg.mentions.everyone) {
        return true;
    }

    if (users && msg.mentions.users.size) {
        return true;
    }

    if (roles && msg.mentions.roles.size) {
        return true;
    }

    return false;
}

/**
 * 
 * @param {*} msg 
 * @returns an array of mentioned user ID's in the order they appear in the message
 */
export function parseUserMentions(msg) {
    const words = msg.content.split(' ');

    let mentions = [];

    for (let i = 0, n = words.length; i < n; i++) {
        let word = words[i];

        if (word.startsWith('<@') && word.endsWith('>')) {
            word = word.slice(2, -1);

            if (word.startsWith('!')) {
                word = word.slice(1);
            }

            mentions.push(word);
        }
    }

    return mentions;
}

/**
 * gets the username and image link from a message
 * 
 * @param {*} msg 
 * @param {*} args 
 * @returns 
 * success: if there is a username and avatar detected
 * 
 * validURL: if the link of the image is valid
 * 
 * username: extracted username string
 * 
 * avatarLink: extracted avatar link
 */
export function extractNameAndAvatar(msg, args) {
    let validURL = true;
    let username = '';
    let avatarLink = '';

    const argArr = args.join(' ').split(tagSeparator);

    const attachment = msg.attachments.map(img => img.url)[0];
    const extractedUsername = argArr.shift().trim();
    const link = argArr.join(tagSeparator).trimStart(); // the end is assumed to be trimmed

    const hasImgAttachment = typeof attachment !== 'undefined';

    const success = (hasImgAttachment || link.length) && extractedUsername.length;

    if (success) {
        username = extractedUsername;

        if (hasImgAttachment) {
            avatarLink = attachment;
        }
        else {
            avatarLink = link;
            validURL = isValidURL(avatarLink);
        }
    }

    return {
        success,
        validURL,
        username,
        avatarLink
    }
}

/**
 * finds or creates a webhook
 * updates the webhook db and cache
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
async function getWebhookAndUpdateDB(msg) {
    // check if the channel is a thread

    let channel = msg.channel;

    if (channel.isThread()) {
        channel = await getChannel(msg.client, channel.parentId);
    }

    //-----------------------------
    // fetch webhook

    const channelWebhooks = await channel.fetchWebhooks();
    let webhook = channelWebhooks.find(w => w.owner.id === clientID);

    // create webhook
    if (typeof webhook === 'undefined') {
        webhook = await channel.createWebhook(msg.client.user.username);
    }

    //-----------------------------
    // update cache and db

    webhooks.upsert(channel.id, webhook.id, webhook.token);
    tulpCache.upsert(channel.id, webhook);

    return webhook;
}

/**
 * gets a webhook from the cache, db, or discord
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
async function getWebhook(msg) {
    const channelID = msg.channel.id;

    // check cache
    let webhook = tulpCache.get(channelID);

    if (webhook) {
        return webhook;
    }

    //-----------------------------
    // check db

    webhook = await webhooks.get(channelID);

    if (webhook) {
        const webhookObj = new WebhookClient({
            id: webhook.id,
            token: webhook.token
        });

        tulpCache.upsert(channelID, webhookObj);

        return webhookObj;
    }

    //-----------------------------
    // check discord or create one

    return getWebhookAndUpdateDB(msg);
}

/**
 * send webhook messages by trying the given webhook
 * 
 * @param {*} msgObj discord.js msg object
 * @param {*} webhookContent
 * @param {*} webhook discord.js webhook object
 * @returns 
 */
async function tryWebhook(msgObj, webhookContent, webhook) {
    if (!webhookContent.content.length) {
        webhookContent.content = undefined;
    }

    //-----------------------------
    // check if the channel is a thread

    if (msgObj.channel.isThread()) {
        webhookContent.threadId = msgObj.channel.id;
    }

    //-----------------------------
    // send message

    try {
        return await webhook.send(webhookContent);
    }
    catch (error) {
        // Unknown Webhook error
        if (error.code === 10015) {
            webhook = await getWebhookAndUpdateDB(msgObj);

            return webhook.send(webhookContent);
        }

        throw error;
    }
}

/**
 * send webhook messages
 * 
 * @param {*} msgObj discord.js msg object
 * @param {*} webhookContent
 * @returns 
 */
export async function sendWebhookMsg(msgObj, webhookContent) {
    const webhook = await getWebhook(msgObj);

    return tryWebhook(msgObj, webhookContent, webhook);
}

/**
 * send webhook messages
 * 
 * @param {*} msgObj discord.js msg object
 * @param {*} webhookContent 
 * @param {*} webhook discord.js webhook object
 * @returns 
 */
export async function sendWebhookMsgUsingWebhook(msgObj, webhookContent, webhook) {
    if (webhook) {
        return tryWebhook(msgObj, webhookContent, webhook);
    }

    return sendWebhookMsg(msgObj, webhookContent);
}
