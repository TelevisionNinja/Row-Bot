import {
    webhooks,
    tulps
} from './database.js';
import { WebhookClient } from 'discord.js';

const cache = new Map();
// 1 min
const expiryTime = 60000;

export default {
    has,
    hasHit,
    remove,
    get,
    insert,
    replace,
    upsert,

    deleteWebhook,
    fetchWebhookAndUpdateDBAndCache,
    getWebhook,
    getUser,
    findTulp
}

//-------------------------------------------------------
// cache functions

/**
 * resets the entry's timeout time
 * 
 * @param {*} id 
 * @param {*} entry 
 */
function cacheHit(id, entry) {
    clearTimeout(entry.timeoutID);
    entry.timeoutID = setTimeout(() => cache.delete(id), expiryTime);
}

/**
 * updates the entry's data with new data
 * 
 * @param {*} id 
 * @param {*} entry 
 * @param {*} data 
 */
function replaceEntryData(id, entry, data) {
    cacheHit(id, entry);
    entry.data = data;
}

/**
 * check if the id is in the cache
 * 
 * @param {*} id 
 * @returns bool
 */
function has(id) {
    return cache.has(id);
}

/**
 * check if the id is in the cache
 * if the id is present, cacheHit() will be called
 * 
 * @param {*} id 
 * @returns bool
 */
function hasHit(id) {
    const entry = cache.get(id);

    if (typeof entry === 'undefined') {
        return false;
    }

    cacheHit(id, entry);
    return true;
}

/**
 * removes the entry
 * 
 * @param {*} id 
 */
function remove(id) {
    const entry = cache.get(id);

    if (typeof entry !== 'undefined') {
        clearTimeout(entry.timeoutID);
        cache.delete(id);
    }
}

/**
 * returns the data for the id
 * 
 * @param {*} id 
 * @returns cached item
 */
function get(id) {
    const entry = cache.get(id);

    if (typeof entry === 'undefined') {
        return null;
    }

    cacheHit(id, entry);
    //cache.set(id, element);

    return entry.data;
}

/**
 * this does not reset the timeout for the id if there is an existing entry
 * 
 * @param {*} id 
 * @param {*} data 
 */
function insert(id, data) {
    cache.set(id, {
        data: data,
        timeoutID: setTimeout(() => cache.delete(id), expiryTime)
    });
}

/**
 * replaces the data for the id
 * 
 * @param {*} id 
 * @param {*} data 
 */
function replace(id, data) {
    const entry = cache.get(id);

    if (typeof entry !== 'undefined') {
        replaceEntryData(id, entry, data);
        //cache.set(id, element);
    }
}

/**
 * replaces the data for the id if there is an existing entry
 * 
 * @param {*} id 
 * @param {*} data 
 */
function upsert(id, data) {
    const entry = cache.get(id);

    if (typeof entry === 'undefined') {
        insert(id, data);
    }
    else {
        replaceEntryData(id, entry, data);
        //cache.set(id, element);
    }
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
    const webhook = channelWebhooks.find(w => w.owner.id === clientID);

    // create webhook
    if (typeof webhook === 'undefined') {
        return await channel.createWebhook(msg.client.user.username);
    }

    return webhook;
}

/**
 * fetches or creates a webhook
 * updates the DB and cache
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
async function fetchWebhookAndUpdateDBAndCache(msg) {
    const webhook = await fetchWebhookFromDiscord(msg);
    webhooks.update(msg.channel.id, webhook.id, webhook.token);
    // webhooks.upsert(msg.channel.id, webhook.id, webhook.token);
    upsert(msg.channel.id, webhook);

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
    // webhooks.upsert(msg.channel.id, webhook.id, webhook.token);

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
    insert(msg.channel.id, webhook);
    // upsert(msg.channel.id, webhook);

    return webhook;
}

/**
 * gets a webhook from the cache
 * updates the cache if not found
 * 
 * @param {*} msg discord.js msg object
 * @returns discord.js webhook object
 */
function getWebhook(msg) {
    // check cache

    const webhook = get(msg.channel.id);

    if (webhook !== null) {
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
function deleteWebhook(id) {
    // delete from cache
    remove(id);

    // delete from db
    webhooks.delete(id);
}

//-------------------------------------------------------
// user fetching functions

/**
 * fetches user data from the db
 * 
 * @param {*} id 
 * @returns user data
 */
async function fetchUser(id) {
    const userData = await tulps.getAll(id);
    insert(id, userData);
    // upsert(id, userData);
    return userData;
}

/**
 * gets a user from the cache
 * fetches the user if not in the cache
 * 
 * @param {*} id user id
 * @returns user data
 */
function getUser(id) {
    const userData = get(id);

    if (userData) {
        return userData;
    }

    return fetchUser(id);
}

/**
 * fetches all of the user's data
 * the specific tulp is then found using linear search
 * 
 * @param {*} user_id id of the user
 * @param {*} text message sent by the user
 * @returns specific tulp
 */
async function findTulp(user_id, text) {
    // fetch and cache the user's data
    const tulpArr = await getUser(user_id);

    if (!tulpArr.length) {
        return null;
    }

    //-------------------------------------------------------------------
    // linear search

    let selectedTulp = {
        start_bracket: '',
        end_bracket: ''
    };

    for (let i = 0, n = tulpArr.length; i < n; i++) {
        const currentTulp = tulpArr[i];
        const combinedLength = currentTulp.start_bracket.length + currentTulp.end_bracket.length;

        if (combinedLength > selectedTulp.start_bracket.length + selectedTulp.end_bracket.length &&
            combinedLength <= text.length &&
            text.startsWith(currentTulp.start_bracket) &&
            text.endsWith(currentTulp.end_bracket)) {
            selectedTulp = currentTulp;
        }
    }

    if (typeof selectedTulp.username === 'undefined') {
        return null;
    }

    return selectedTulp;
}
