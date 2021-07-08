let queues = new Map();

export function get(guildID) {
    const result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return [];
    }

    return result;
}

export function push(guildID, url) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        queues.set(guildID, [url]);
    }
    else {
        result.push(url);
        queues.set(guildID, result);
    }
}

/**
 * 
 * @param {*} guildID 
 * @returns true if there are songs in the queue, false if there are no more songs
 */
export function pop(guildID) {
    let result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return false;
    }

    result.shift();

    if (result.length) {
        queues.set(guildID, result);
        return true;
    }

    queues.delete(guildID);
    return false;
}

export function clear(guildID) {
    const result = queues.get(guildID);

    if (typeof result === 'undefined') {
        return;
    }

    if (result.length > 1) {
        queues.set(guildID, [result.shift()]);
    }
}
