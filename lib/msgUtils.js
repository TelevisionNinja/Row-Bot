import { default as config } from '../config.json';
import {
    cutOff,
    isValidURL
} from './stringUtils.js';
import { WebhookClient } from 'discord.js';
import { default as tulpCache } from './tulpCache.js';
import { webhooks } from './database.js';

const readingSpeed = config.readingSpeed, // this is wpm
    typingSpeed = config.typingSpeed, // this is wpm
    reactionSpeed = config.reactionSpeed, // this is ms
    clientID = config.clientID,
    noResultsMsg = config.noResultsMsg,
    tagSeparator = config.tagSeparator,
    rule = config.rule;

/**
 * sends an image
 * 
 * @param {*} client 
 * @param {*} img image object
 * @param {*} sendResults bool to send results with the image
 */
export function sendImg(client, img, sendResults = true) {
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

            client.send(infoText);
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

            client.send({ embeds: [embedObj] });
        }
    }
    else {
        client.send(noResultsMsg);
    }
}

/**
 * starts typing and then sends a message
 * 
 * @param {*} client 
 * @param {*} sendingMsg 
 * @param {*} readingMsg 
 * @returns 
 */
export function sendTypingMsg(client, sendingMsg, readingMsg) {
    /*
        wpm to ms per char formula
        (1000 ms) / (wpm / (60 s) * (6 chars per word))
        = (1000 ms) * (60 s) / (wpm * (6 chars per word))
        = (1000 ms) * (10 s) / wpm
    */
    const typingSpeedMs = 10000 / typingSpeed;
    const readingSpeedMs = 10000 / readingSpeed;

    let typingTime = sendingMsg.length * typingSpeedMs + reactionSpeed;
    let readingTime = readingMsg.length * readingSpeedMs + reactionSpeed;

    // limit of 30 seconds
    if (typingTime > 30000) {
        typingTime = 30000;
    }

    if (readingTime > 30000) {
        readingTime = 30000;
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.sendTyping();

            setTimeout(async () => {
                try {
                    await client.send(sendingMsg);
                    resolve();
                }
                catch (error) {
                    console.log(error);
                    reject();
                }
            }, typingTime); // time before sending
        }, readingTime) // time before typing
    });
}

/**
 * 
 * @param {*} client 
 * @param {*} ID channel id
 * @returns 
 */
export async function getRecipient(client, ID) {
    let recipient = client.channels.cache.get(ID);

    if (typeof recipient !== 'undefined') {
        return recipient;
    }

    recipient = await client.channels.fetch(ID);

    if (typeof recipient !== 'undefined') {
        return recipient;
    }

    recipient = client.users.cache.get(ID)

    if (typeof recipient === 'undefined') {
        return await client.users.fetch(ID).createDM();
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
 * @param {*} client channel
 * @param {*} msg message to be sent through DM's
 * @param {*} sendTyping send a typing message or not, default value is false
 * @param {*} readingMsg message to read before typing, default value is an empty string
 */
export async function sendDirectDm(client, msg, sendTyping = false, readingMsg = '') {
    if (sendTyping) {
        const dm = await client.createDM();

        sendTypingMsg(dm, msg, readingMsg);
    }
    else {
        client.send(msg);
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

    if (users) {
        const userMentionArr = [...msg.mentions.users.values()].map(m => m.id);

        if (userMentionArr.length && userMentionArr.includes(clientID)) {
            return true;
        }
    }

    if (roles) {
        const roleMentionArr = [...msg.mentions.roles.values()].map(m => m.id);

        if (roleMentionArr.length) {
            const botRoles = [...msg.guild.me.roles.cache.values()].map(r => r.id);

            if (roleMentionArr.some(r => botRoles.includes(r))) {
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
    const link = argArr.join(tagSeparator).trim();

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
 * updates the webhook db
 * 
 * @param {*} msg 
 * @returns webhook
 */
async function getWebhookAndUpdateDB(msg) {
    const channelWebhooks = await msg.channel.fetchWebhooks();
    let webhook = channelWebhooks.find(w => w.owner.id === clientID);

    if (typeof webhook === 'undefined') {
        webhook = await msg.channel.createWebhook(msg.client.user.username);
    }

    webhooks.upsert(msg.channel.id, webhook.id, webhook.token);
    tulpCache.replace(msg.channel.id, webhook);

    return webhook;
}

/**
 * gets a webhook from the db or discord
 * 
 * @param {*} msg 
 * @returns webhook
 */
async function getWebhook(msg) {
    const webhook = await webhooks.get(msg.channel.id);

    if (webhook) {
        return new WebhookClient({
            id: webhook.id,
            token: webhook.token
        });
    }

    return await getWebhookAndUpdateDB(msg);
}

/**
 * send webhook messages by trying the given webhook
 * 
 * @param {*} msgObj 
 * @param {*} msg 
 * @param {*} attachments 
 * @param {*} name 
 * @param {*} avatar 
 * @param {*} webhook 
 * @returns 
 */
async function tryWebhook(msgObj, msg, attachments, name, avatar, webhook) {
    if (!msg.length) {
        msg = undefined;
    }

    try {
        return await webhook.send({
            content: msg,
            username: name,
            avatarURL: avatar,
            files: attachments
        });
    }
    catch (error) {
        // Unknown Webhook error
        if (error.code === 10015) {
            webhook = await getWebhookAndUpdateDB(msgObj);

            return webhook.send({
                content: msg,
                username: name,
                avatarURL: avatar,
                files: attachments
            });
        }

        throw error;
    }
}

/**
 * send webhook messages
 * 
 * @param {*} msgObj 
 * @param {*} msg 
 * @param {*} attachments 
 * @param {*} name 
 * @param {*} avatar 
 * @returns 
 */
export async function sendWebhookMsg(msgObj, msg, attachments, name, avatar) {
    const webhook = await getWebhook(msgObj);

    return tryWebhook(msgObj, msg, attachments, name, avatar, webhook);
}

/**
 * send webhook messages
 * 
 * @param {*} msgObj 
 * @param {*} msg 
 * @param {*} attachments 
 * @param {*} name 
 * @param {*} avatar 
 * @param {*} webhook 
 * @returns 
 */
export async function sendWebhookMsgUsingWebhook(msgObj, msg, attachments, name, avatar, webhook) {
    if (webhook) {
        const webhookObj = new WebhookClient({
            id: webhook.id,
            token: webhook.token
        });

        return tryWebhook(msgObj, msg, attachments, name, avatar, webhookObj);
    }

    return sendWebhookMsg(msgObj, msg, attachments, name, avatar);
}
