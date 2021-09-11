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
    upsert
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
