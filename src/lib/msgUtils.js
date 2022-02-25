import config from '../../config/config.json' assert { type: 'json' };
import { isValidURL } from './urlUtils.js';
import {
    cutOff,
    includesPhrase,
    removeAllSpecialChars
} from './stringUtils.js';
import { default as tulpCache } from './tulpCache.js';

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
    rule = config.rule,
    names = config.names;

/**
 * creates an image query result
 * 
 * @param {*} img image object
 * @param {*} sendResults bool to send results with the image
 * @returns object with the contents of a message
 */
export function createImgResult(img, sendResults = true) {
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

            return { content: infoText };
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
                embedObj.fields.push({
                    name: 'Description',
                    value: cutOff(img.description, 1024)
                });
            }

            if (img.artist.length) {
                embedObj.fields.push({
                    name: img.artist.length === 1 ? 'Artist' : 'Artists',
                    value: cutOff(img.artist.join(', '), 1024)
                });
            }

            if (sendResults) {
                embedObj.footer = { text: `Results: ${img.results}` };
            }

            return { embeds: [embedObj] };
        }
    }

    return { content: noResultsMsg };
}

/**
 * starts typing and then sends a message
 * 
 * @param {*} recipient message or channel object
 * @param {*} sendingContent message content object
 * @param {*} readingMsg 
 * @param {*} isReply 
 * @returns 
 */
export function sendTypingMsg(recipient, sendingContent, readingMsg = '', isReply = false) {
    let typingTime = sendingContent.content.length * typingSpeed + reactionSpeed;
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
            if (typeof recipient.channel === 'undefined') { // is channel
                recipient.sendTyping();
            }
            else { // is message
                recipient.channel.sendTyping();
            }

            setTimeout(async () => {
                try {
                    if (typeof recipient.channel === 'undefined') { // is channel
                        resolve(await recipient.send(sendingContent));
                    }
                    else { // is message
                        if (isReply) {
                            resolve(await recipient.reply(sendingContent));
                        }
                        else {
                            resolve(await recipient.channel.send(sendingContent));
                        }
                    }
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
 * @param {*} msg discord js message obj
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
 * @param {*} msgContent message content object to be sent through DM's
 * @param {*} sendTyping send a typing message or not, default value is false
 * @param {*} readingMsg message to read before typing, default value is an empty string
 */
export async function sendDirectDm(channel, msgContent, sendTyping = false, readingMsg = '') {
    if (sendTyping) {
        const dm = await channel.createDM();

        sendTypingMsg(dm, msgContent, readingMsg);
    }
    else {
        channel.send(msgContent);
    }
}

/**
 * if the bot directly, the bot's name, everyone / here, or one of its roles is mentioned, true will be returned
 * 
 * @param {*} msg 
 * @param {*} everyone check for mentions of everyone in the message, default is true
 * @param {*} users check for mentions of users in the message, default is true
 * @param {*} roles check for mentions of roles in the message, default is true
 * @param {*} name check for mentions of one of the bot's names in the message, default is true
 * @param {*} excludeSpecialChars exclude special chars in the message, default is false
 * @returns a bool for whether the bot was mentioned and the name of the bot if it was used to mention the bot
 */
export function hasBotMention(msg, everyone = true, users = true, roles = true, name = true, excludeSpecialChars = false) {
    if (msg.mentions.has(clientID, {
            ignoreEveryone: !everyone,
            ignoreDirect: !users
        }) || (roles && [...msg.mentions.roles.values()].some(r => r.members.has(clientID)))) {
        return {
            mentioned: true,
            name: ''
        };
    }

    if (name) {
        let content = msg.content,
            selectedName = '';

        if (excludeSpecialChars) {
            content = removeAllSpecialChars(content);
        }

        for (let i = 0, n = names.length; i < n; i++) {
            const currentName = names[i];
    
            if (currentName.length > selectedName.length && includesPhrase(content, currentName, false)) {
                selectedName = currentName;
            }
        }

        if (selectedName.length) {
            return {
                mentioned: true,
                name: selectedName
            };
        }
    }

    return {
        mentioned: false,
        name: ''
    };
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
            webhook = await tulpCache.fetchWebhookAndUpdateDB(msgObj);

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
    const webhook = await tulpCache.getWebhook(msgObj);

    return tryWebhook(msgObj, webhookContent, webhook);
}
