const errorCodes = new Set([]);

/**
 * back off using fetch and p-queue
 * 
 * @param {*} response 
 * @param {*} queue 
 * @returns true if backed off, false if not
 */
export function backOff(response, queue) {
    const errorCode = response.status;
    let backedOff = false;

    if ((errorCode >= 400 || errorCodes.has(errorCode)) && !queue.isPaused) {
        queue.pause();
        backedOff = true;

        const retryTime = response.headers.get('retry-after');
        let time = 1;

        if (typeof retryTime !== 'undefined') {
            const parsedNum = parseInt(retryTime, 10);

            if (isNaN(parsedNum)) {
                time = (new Date(retryTime).getTime() - Date.now()) || 1000;
            }
            else {
                time = parsedNum * 1000;
            }

            if (time <= 0) {
                time = 1;
            }
        }

        setTimeout(() => {
            queue.clear();
            queue.start();
        }, time);
    }

    return backedOff;
}

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const isValidURLRegex = new RegExp(/^https?:\/\/(([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.){0,}([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/\S{0,})?$/i);

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
export function isValidURL(str) {
    return isValidURLRegex.test(str);
}

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const containsURLRegex = new RegExp(/\bhttps?:\/\/(([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.){0,}([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/\S{0,})?\b/i);

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
export function containsURL(str) {
    return containsURLRegex.test(str);
}

const extractAmpUrlsRegex = new RegExp(/\bhttps?:\/\/(([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.){0,}(((?=([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.)[a-z0-9-]{0,}amp[a-z0-9-]{0,}\.(([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.){0,}([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/\S{0,})?)|(([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]\.[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\/\S{0,}amp\S{0,}))\b/ig);

/**
 * 
 * @param {*} str 
 * @returns set of URLs
 */
export function extractAmpUrls(str) {
    const links = [...str.matchAll(extractAmpUrlsRegex)].map(e => e[0]);
    return new Set(links);
}
