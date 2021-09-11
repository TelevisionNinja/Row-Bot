let queues = new Map();

export default {
    get,
    push,
    pop,
    clear,
    popIndex,
    deleteQueue
}

function get(guildID) {
    const result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return [];
    }

    return result;
}

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

    result.splice(index, 1);

    if (result.length) {
        //queues.set(guildID, result);
        return true;
    }

    queues.delete(guildID);
    return false;
}

function deleteQueue(guildID) {
    queues.delete(guildID);
}
