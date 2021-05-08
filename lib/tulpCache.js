let cache = new Map();
let timeouts = new Map();
const expiryTime = 60000;

export default {
    clearCacheTime,
    setCacheTime,
    resetCacheTime,
    has,
    remove,
    get,
    insert,
    replace
}

//--------------------------------------------------------------------------------
// expiry time functions

/**
 * clear cache timeout
 * 
 * @param {*} id 
 */
function clearCacheTime(id) {
    const timeoutID = timeouts.get(id);

    clearTimeout(timeoutID);
}

/**
 * set a new cache timeout
 * 
 * @param {*} id 
 */
function setCacheTime(id) {
    const timeoutID = setTimeout(() => cache.delete(id), expiryTime);

    timeouts.set(id, timeoutID);
}

/**
 * reset timer for a cached item
 * 
 * @param {*} id 
 */
function resetCacheTime(id) {
    clearCacheTime(id);
    setCacheTime(id);
}

//--------------------------------------------------------------------------------
// cache entry functions

/**
 * check if it is the cache
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
    cache.delete(id);

    clearCacheTime(id);

    timeouts.delete(id);
}

/**
 * 
 * @param {*} id 
 * @returns cached item
 */
function get(id) {
    resetCacheTime(id);
    return cache.get(id);
}

/**
 * 
 * @param {*} id 
 * @param {*} obj 
 */
function insert(id, obj) {
    cache.set(id, obj);
    setCacheTime(id);
}

/**
 * 
 * @param {*} id 
 * @param {*} obj 
 */
function replace(id, obj) {
    cache.set(id, obj);
    resetCacheTime(id);
}
