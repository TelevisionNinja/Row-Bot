import PQueue from 'p-queue';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

const errorCodes = new Set([
    429
]);

/**
 * back off using node-fetch and p-queue
 * 
 * @param {*} response 
 * @param {*} queue 
 * @returns true if backed off, false if not
 */
export function backOff(response, queue) {
    const errorCode = response.status;

    if ((errorCodes.has(errorCode) || errorCode >= 500) && !queue.isPaused) {
        queue.pause();

        const retryTime = response.headers.get('retry-after');
        let time = 1;

        if (typeof retryTime !== 'undefined') {
            const parsedNum = parseInt(retryTime);

            if (parsedNum) {
                time = parsedNum * 1000;
            }
            else {
                time = (new Date(retryTime).getTime() - Date.now()) || 1000;
            }
        }

        setTimeout(() => {
            queue.clear();
            queue.start();
        }, time);

        return true;
    }

    return false;
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

const ampSubdomain = 'amp.';
const googleRedirct = 'https://www.google.com/url?q=';
const googleAMPPath = 'https://www.google.com/amp/s/';
const ampDetectRegex = new RegExp(/([^\w\s])amp([^\w\s]|\b)/i);

/**
 * construct a non-amp url
 * 
 * @param {*} oldPath 
 * @param {*} oldDomain 
 * @param {*} oldURL 
 * @param {*} newURL 
 * @returns 
 */
 async function makeNewNonAMPURL(oldPath, oldDomain, oldURL, newURL) {
    if (oldDomain.startsWith(ampSubdomain) && !ampDetectRegex.test(oldPath)) {
        const response = await fetch(`https://${oldURL.substring(googleAMPPath.length + ampSubdomain.length)}`);

        if (!backOffFetch(response, queue) && response.ok) {
            return response.url;
        }
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

/**
 * 
 * @param {*} urlSet set of AMP URL's
 * @returns array of non-AMP URL's
 */
export async function convertAMPSet(urlSet) {
    let newLinks = [];
    let middleLinks = [];
    const urlArray = [...urlSet];
    let responses = [];
    const n = urlSet.size;

    for (let i = 0; i < n; i++) {
        responses.push(queue.add(async () => {
            const response = await fetch(urlArray[i]);

            if (backOff(response, queue)) {
                return '';
            }

            return response.url;
        }));
    }

    responses = await Promise.allSettled(responses);

    for (let i = 0; i < n; i++) {
        let newURL = responses[i].value;

        if (newURL.length !== 0) {
            let oldURL = urlArray[i];

            if (newURL.startsWith(googleRedirct)) {
                newURL = newURL.substring(googleRedirct.length);
            }
            else {
                const partialURL = oldURL.substring(googleAMPPath.length);
                const startOfPath = partialURL.indexOf('/');
                const oldPath = partialURL.substring(startOfPath);
                const oldDomain = partialURL.substring(0, startOfPath);
                const newDomain = extractDomain(newURL);

                if (oldDomain !== newDomain) {
                    newURL = makeNewNonAMPURL(oldPath, oldDomain, oldURL, newURL);
                }
            }

            middleLinks.push(newURL);
        }
    }

    middleLinks = await Promise.allSettled(middleLinks);

    for (let i = 0, linksLen = middleLinks.length; i < linksLen; i++) {
        const newURL = removeForwardSlash(middleLinks[i].value);
        const oldURL = removeForwardSlash(urlArray[i]);

        //---------------------------

        if (newURL !== oldURL) {
            newLinks.push(newURL);
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

const extractDomainRegex = new RegExp(/([^\s\/]{1,}\.)?[^\s\/]{1,}\.[^\s\/]{2,}/i);

/**
 * 
 * @param {*} url 
 * @returns ex: www.example.com
 */
export function extractDomain(url) {
    return url.match(extractDomainRegex)[0];
}
