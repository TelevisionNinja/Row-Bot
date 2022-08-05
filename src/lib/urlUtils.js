import PQueue from 'p-queue';

const ampQueue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

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

        const retryTime = response.headers.get('retry-after');
        let time = 1;

        if (typeof retryTime !== 'undefined') {
            const parsedNum = parseInt(retryTime);

            if (isNaN(parsedNum)) {
                time = (new Date(retryTime).getTime() - Date.now()) || 1000;
            }
            else {
                time = parsedNum * 1000;
            }

            if (time <= 0) {
                time = 1;
            }
            else {
                backedOff = true;
            }
        }

        setTimeout(() => {
            if (backedOff) {
                queue.clear();
            }

            queue.start();
        }, time);
    }

    return backedOff;
}

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const isValidURLRegex = new RegExp(/^https?:\/\/([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?$/i);

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
const containsURLRegex = new RegExp(/\bhttps?:\/\/([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?\b/i);

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

const protocolHttps = 'https://';
const googleRedirct = 'https://www.google.com/url?q=';
const googleAMPPath = 'https://www.google.com/amp/s/';

const ampEndsRegex = new RegExp(/(^amp\.)|([^\w\s]amp$)/ig);

/**
 * 
 * @param {*} url url string without the protocol
 * @returns url with amp head or tail removed
 */
function removeAMPEnds(url) {
    return url.replaceAll(ampEndsRegex, '');
}

const ampPathRegex = new RegExp(/\/(([^\/\.]{1,}-amp)|(amp-[^\/\.]{1,})|(amp))\//ig);

/**
 * 
 * @param {*} url url string
 * @returns url with amp path removed
 */
function removeAMPPath(url) {
    return url.replaceAll(ampPathRegex, '/');
}

const protocolRegex = new RegExp(/^[a-z]{1,}:\/\//i);

/**
 * 
 * @param {*} url single url string
 * @returns 
 */
export function getProtocol(url) {
    const results = url.match(protocolRegex);

    if (results === null) {
        return '';
    }

    return results[0];
}

const removeProtocolRegex = new RegExp(/^[a-z]{1,}:\/\//i);

/**
 * 
 * @param {*} url single url string
 * @returns 
 */
export function removeProtocol(url) {
    return url.replace(removeProtocolRegex, '');
}

/**
 * 
 * @param {*} url url string
 * @returns url with amp head, tail, or path removed
 */
export function removeAMPFromURL(url) {
    const protocol = getProtocol(url);
    return `${protocol}${removeAMPEnds(removeProtocol(removeAMPPath(url)))}`;
}

/**
 * construct a non-amp url
 * 
 * @param {*} oldURL 
 * @param {*} newURL 
 * @param {*} prefix 
 * @returns 
 */
async function makeNonAMPURL(oldURL, newURL, prefix = '') {
    oldURL = oldURL.substring(prefix.length);
    let protocol = getProtocol(oldURL);
    const partOfURL = removeProtocol(oldURL);

    if (protocol.length === 0) {
        protocol = protocolHttps;
    }

    if (partOfURL.match(ampEndsRegex) !== null || partOfURL.match(ampPathRegex) !== null) {
        return ampQueue.add(async () => {
            const response = await fetch(`${protocol}${removeAMPEnds(removeAMPPath(partOfURL))}`);

            if (!backOff(response, ampQueue) && response.ok) {
                return response.url;
            }

            return newURL;
        });
    }

    return newURL;
}

function removeForwardSlash(url) {
    const index = url.length - 1;

    if (url[index] === '/') {
        return url.substring(0, index);
    }

    return url;
}

const extractDomainRegex = new RegExp(/([^\s\/]{1,}\.)?[^\s\/]{1,}\.[^\s\/]{2,}/i);

/**
 * 
 * @param {*} url 
 * @returns ex: www.example.com
 */
export function extractDomain(url) {
    const results = url.match(extractDomainRegex);

    if (results === null) {
        return '';
    }

    return results[0];
}

/**
 * 
 * @param {*} urlSet set of AMP URL's
 * @returns array of non-AMP URL's
 */
export async function convertAMPSet(urlSet) {
    let newLinks = [];
    const urlArray = [...urlSet];
    let responses = [];
    const n = urlSet.size;

    for (let i = 0; i < n; i++) {
        responses.push(ampQueue.add(async () => {
            let url = urlArray[i];

            if (!url.startsWith(googleAMPPath)) {
                url = removeAMPFromURL(url);
            }

            const response = await fetch(url);

            if (!backOff(response, ampQueue) && response.ok) {
                return response.url;
            }

            return '';
        }));
    }

    responses = await Promise.allSettled(responses);

    for (let i = 0; i < n; i++) {
        let newURL = '';

        if (responses[i].status === 'fulfilled') {
            newURL = responses[i].value;

            if (newURL.length !== 0) {
                let oldURL = urlArray[i];

                if (newURL.startsWith(googleRedirct)) {
                    newURL = makeNonAMPURL(newURL, newURL, googleRedirct);
                }
                else if (oldURL.startsWith(googleAMPPath)) {
                    const partialURL = oldURL.substring(googleAMPPath.length);
                    const startOfPath = partialURL.indexOf('/');
                    const oldDomain = partialURL.substring(0, startOfPath);

                    if (oldDomain !== extractDomain(newURL)) {
                        newURL = makeNonAMPURL(oldURL, newURL, googleAMPPath);
                    }
                }
            }
        }

        responses[i] = newURL;
    }

    responses = await Promise.allSettled(responses);

    for (let i = 0; i < n; i++) {
        if (responses[i].status === 'fulfilled') {
            let newURL = responses[i].value;

            if (newURL.length !== 0) {
                newURL = removeForwardSlash(newURL);
                const oldURL = removeForwardSlash(urlArray[i]);

                //---------------------------

                if (newURL !== oldURL) {
                    newLinks.push(newURL);
                }
            }
        }
    }

    return newLinks;
}

const extractAmpUrlsRegex = new RegExp(/https?:\/\/((([^\s\/]{1,}[^\w\s\/])?amp\.([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?)|(([^\s\/]{1,}\.)?\w{1,}\.\w{2,}\/(\S{0,}[^\w\s])?amp\S{0,}))\b/ig);

/**
 * 
 * @param {*} str 
 * @returns set of URLs
 */
export function extractAmpUrls(str) {
    const links = [...str.matchAll(extractAmpUrlsRegex)].map(e => e[0]);
    return new Set(links);
}

/**
 * 
 * @param {*} str 
 * @returns array of non-AMP links
 */
export function extractAndConvertAmpLinks(str) {
    const linkSet = extractAmpUrls(str);

    if (linkSet.size) {
        return convertAMPSet(linkSet);
    }

    return [];
}
