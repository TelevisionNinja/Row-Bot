let queues = new Map();

export default {
    get,
    push,
    pop,
    clear,
    popIndex,
    deleteQueue,
    jump,
    getCurrentSong
}

/**
 * get the queue of a guild
 * 
 * @param {*} guildID 
 * @returns 
 */
function get(guildID) {
    const result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return [];
    }

    return result;
}

/**
 * get the current playing song (front of the queue)
 * 
 * @param {*} guildID 
 * @returns 
 */
function getCurrentSong(guildID) {
    const result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return '';
    }

    return result[0];
}

/**
 * push a song to the back of the queue
 * 
 * @param {*} guildID 
 * @param {*} url 
 */
function push(guildID, url) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        queues.set(guildID, [url]);
    }
    else {
        result.push(url);
        //queues.set(guildID, result);
    }
}

/**
 * remove the current song in a queue
 * 
 * @param {*} guildID 
 * @returns true if there are songs in the queue, false if there are no more songs
 */
function pop(guildID) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return false;
    }

    result.shift();

    if (result.length) {
        //queues.set(guildID, result);
        return true;
    }

    queues.delete(guildID);
    return false;
}

/**
 * clear the queue of a guild
 * 
 * @param {*} guildID 
 * @returns 
 */
function clear(guildID) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return;
    }

    if (result.length > 1) {
        result.splice(1);
        //queues.set(guildID, [result[0]]);
    }
}

/**
 * remove a song at an index in a queue
 * 
 * @param {*} guildID 
 * @param {*} index index of song to remove
 * @returns true if there are songs in the queue, false if there are no more songs
 */
function popIndex(guildID, index) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return false;
    }

    if (index < 0 || index >= result.length || result.length === 1) {
        return false;
    }

    result.splice(index, 1);

    if (result.length) {
        //queues.set(guildID, result);
        return true;
    }

    queues.delete(guildID);
    return false;
}

/**
 * delete the queue of a guild
 * 
 * @param {*} guildID 
 */
function deleteQueue(guildID) {
    queues.delete(guildID);
}

/**
 * jump to an index in a queue
 * 
 * @param {*} guildID 
 * @param {*} index 
 * @returns 
 */
function jump(guildID, index) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return false;
    }

    if (index < 0 || index >= result.length || result.length === 1) {
        return false;
    }

    result.splice(0, index);

    if (result.length) {
        //queues.set(guildID, result);
        return true;
    }

    queues.delete(guildID);
    return false;
}
