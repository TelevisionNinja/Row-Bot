import { webhooks } from './database.js';
import { WebhookClient } from 'discord.js';
import { webhookCache } from './cache.js';

/**
 * 
 * @param {*} client 
 * @param {*} id channel id
 * @returns 
 */
export function getChannel(client, id) {
    const channel = client.channels.cache.get(id);

    if (typeof channel === 'undefined') {
        return client.channels.fetch(id);
    }

    return channel;
}

/**
 * 
 * @param {*} client 
 * @param {*} id user id
 * @returns 
 */
export function getMember(client, id) {
    const member = client.members.cache.get(id);

    if (typeof member === 'undefined') {
        return client.members.fetch(id);
    }

    return member;
}

/**
 * 
 * @param {*} client 
 * @param {*} id user id
 * @returns 
 */
export async function getDMChannel(client, id) {
    return (await getMember(client, id)).createDM();
}

//-------------------------------------------------------
// webhook fetching functions

/**
 * fetches or creates a webhook
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
async function fetchWebhookFromDiscord(msg) {
    // check if the channel is a thread

    let channel = msg.channel;

    if (channel.isThread()) {
        channel = await getChannel(msg.client, channel.parent.id);
    }

    //-----------------------------
    // fetch webhook

    const channelWebhooks = await channel.fetchWebhooks();
    const webhook = channelWebhooks.find(w => w.owner.id === msg.client.user.id);

    // create webhook
    if (typeof webhook === 'undefined') {
        return await channel.createWebhook({
            name: msg.client.user.username,
            avatar: msg.client.user.avatarURL(),
            reason: 'This is needed for tulp commands and message proxying'
        });
    }

    return webhook;
}

/**
 * fetches or creates a webhook
 * updates the DB and cache
 * 
 * used for when the info in the DB is wrong
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
export async function fetchWebhookAndUpdateDBAndCache(msg) {
    const webhook = await fetchWebhookFromDiscord(msg);
    webhooks.update(msg.channel.id, webhook.id, webhook.token);
    webhookCache.set(msg.channel.id, webhook);

    return webhook;
}

/**
 * fetches a webhook from the DB
 * updates the DB if not found
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
async function fetchWebhookFromDB(msg) {
    let webhook = await webhooks.get(msg.channel.id);

    if (webhook) {
        const webhookObj = new WebhookClient({
            id: webhook.id,
            token: webhook.token
        });

        return webhookObj;
    }

    //-----------------------------
    // check discord or create one

    webhook = await fetchWebhookFromDiscord(msg);
    webhooks.set(msg.channel.id, webhook.id, webhook.token);

    return webhook;
}

/**
 * fetches a webhook and updates the cache
 * 
 * @param {*} msg discord.js msg object
 * @returns 
 */
async function fetchWebhookAndUpdateCache(msg) {
    const webhook = await fetchWebhookFromDB(msg);
    webhookCache.set(msg.channel.id, webhook);

    return webhook;
}

/**
 * gets a webhook from the cache
 * updates the cache if not found
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
export function getWebhook(msg) {
    // check cache

    const webhook = webhookCache.get(msg.channel.id);

    if (webhook) {
        return webhook;
    }

    //-----------------------------
    // check db

    return fetchWebhookAndUpdateCache(msg);
}

/**
 * deletes a webhook from the cache and the db
 * 
 * @param {*} id channel id
 */
export function deleteWebhook(id) {
    // delete from cache
    webhookCache.delete(id);

    // delete from db
    webhooks.delete(id);
}

//-------------------------------------------------------
// tulp user fetching functions

// /**
//  * fetches user data from the db
//  * 
//  * @param {*} id 
//  * @returns user data
//  */
// async function fetchUser(id) {
//     const userData = await tulps.getAll(id);
//     userCache.set(id, userData);

//     return userData;
// }

// /**
//  * gets a user from the cache
//  * fetches the user if not in the cache
//  * 
//  * @param {*} id user id
//  * @returns user data
//  */
// export function getUser(id) {
//     const userData = userCache.get(id);

//     if (userData) {
//         return userData;
//     }

//     return fetchUser(id);
// }

// /**
//  * fetches all of the user's data
//  * the specific tulp is then found using linear search
//  * 
//  * @param {*} user_id id of the user
//  * @param {*} text message sent by the user
//  * @returns specific tulp
//  */
// export async function findTulp(user_id, text) {
//     // fetch and cache the user's data
//     const tulpArr = await getUser(user_id);

//     if (!tulpArr.length) {
//         return null;
//     }

//     //-------------------------------------------------------------------
//     // linear search

//     let selectedTulp = {
//         start_bracket: '',
//         end_bracket: ''
//     };

//     for (let i = 0, n = tulpArr.length; i < n; i++) {
//         const currentTulp = tulpArr[i];
//         const combinedLength = currentTulp.start_bracket.length + currentTulp.end_bracket.length;

//         if (combinedLength > selectedTulp.start_bracket.length + selectedTulp.end_bracket.length &&
//             combinedLength <= text.length &&
//             text.startsWith(currentTulp.start_bracket) &&
//             text.endsWith(currentTulp.end_bracket)) {
//             selectedTulp = currentTulp;
//         }
//     }

//     if (typeof selectedTulp.username === 'undefined') {
//         return null;
//     }

//     return selectedTulp;
// }
