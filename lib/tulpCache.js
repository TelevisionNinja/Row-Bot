import {
    webhooks,
    tulps
} from './database.js';
import { WebhookClient } from 'discord.js';

let cache = new Map();
// 1 min
const expiryTime = 60000;

export default {
    resetCacheTime,
    has,
    remove,
    get,
    insert,
    replace,
    upsert,
    cacheWebhook,
    cacheUser
}

/**
 * reset timer for a cached item
 * 
 * @param {*} id 
 */
function resetCacheTime(id) {
    let element = cache.get(id);

    if (typeof element === 'undefined') {
        return;
    }

    clearTimeout(element.timeoutID);

    element.timeoutID = setTimeout(() => cache.delete(id), expiryTime);
    //cache.set(id, element);
}

/**
 * check if it is in the cache
 * 
 * @param {*} id 
 * @returns 
 */
function has(id) {
    return cache.has(id);
}

/**
 * remove cache entry
 * 
 * @param {*} id 
 */
function remove(id) {
    let element = cache.get(id);

    if (typeof element === 'undefined') {
        return;
    }

    clearTimeout(element.timeoutID);
    cache.delete(id);
}

/**
 * 
 * @param {*} id 
 * @returns cached item
 */
function get(id) {
    let element = cache.get(id);

    if (typeof element === 'undefined') {
        return element;
    }

    clearTimeout(element.timeoutID);

    element.timeoutID = setTimeout(() => cache.delete(id), expiryTime);
    //cache.set(id, element);

    return element.data;
}

/**
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
 * 
 * @param {*} id 
 * @param {*} data 
 */
function replace(id, data) {
    let element = cache.get(id);

    if (typeof element === 'undefined') {
        return;
    }

    clearTimeout(element.timeoutID);

    element.data = data;
    element.timeoutID = setTimeout(() => cache.delete(id), expiryTime);
    //cache.set(id, element);
}

/**
 * 
 * @param {*} id 
 * @param {*} data 
 */
function upsert(id, data) {
    let element = cache.get(id);

    if (typeof element === 'undefined') {
        cache.set(id, {
            data: data,
            timeoutID: setTimeout(() => cache.delete(id), expiryTime)
        });
    }
    else {
        clearTimeout(element.timeoutID);

        element.data = data;
        element.timeoutID = setTimeout(() => cache.delete(id), expiryTime);
        //cache.set(id, element);
    }
}

/**
 * caches a webhook
 * 
 * @param {*} id channel id
 */
async function cacheWebhook(id) {
    if (cache.has(id)) {
        resetCacheTime(id);
    }
    else {
        const webhook = await webhooks.get(id);

        if (webhook) {
            const webhookObj = new WebhookClient({
                id: webhook.id,
                token: webhook.token
            });

            insert(id, webhookObj);
        }
    }
}

/**
 * caches a user
 * 
 * @param {*} id user id
 * @returns true - user exists, false - user doesn't exist
 */
async function cacheUser(id) {
    if (cache.has(id)) {
        resetCacheTime(id);
        return true;
    }
    else {
        const userData = await tulps.getAll(id);

        if (userData.length) {
            insert(id, userData);
            return true;
        }

        insert(id, null);
        return false;
    }
}
