import axios from 'axios';
import PQueue from 'p-queue';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * back off using axios and p-queue
 * 
 * @param {*} error 
 * @param {*} queue 
 * @returns true if backed off, false if not
 */
export function backOff(error, queue) {
    const errorCode = error.response.status;

    if ((errorCode === 429 || errorCode >= 500) && !queue.isPaused) {
        queue.pause();

        const retryTime = error.response.headers['retry-after'];
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

/**
 * replaces html entities with their character equivalent
 * 
 * @param {*} str 
 * @returns 
 */
export function replaceHTMLEntities(str) {
    return str.replaceAll('&quot;', '"')
        .replaceAll('&#39;', '\'')
        .replaceAll('&apos;', '\'')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
}

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const isValidURLRegex = new RegExp(/^(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})(\/[\S]{0,})?$/i);

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
const containsURLRegex = new RegExp(/\b(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})(\/[\S]{0,})?\b/i);

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

/**
 * 
 * @param {*} urlSet set of AMP URL's
 * @returns array of non-AMP URL's
 */
export async function convertAMPSet(urlSet) {
    let newLinks = [];

    try {
        const urlArray = [...urlSet];
        let responses = [];
        const n = urlSet.size;

        for (let i = 0; i < n; i++) {
            responses.push(queue.add(() => axios.get(urlArray[i])));
        }

        responses = await Promise.allSettled(responses);

        for (let i = 0; i < n; i++) {
            const response = responses[i];

            if (response.status === 'fulfilled') {
                const url = response.value.request.res.responseUrl;

                if (url !== urlArray[i]) {
                    newLinks.push(url);
                }
            }
        }
    }
    catch (error) {
        backOff(error, queue);
        console.log(error);
    }

    return newLinks;
}

/**
 * check if the link is an AMP link
 * 
 * @param {*} url 
 * @returns 
 */
export function isAMP(url) {
    if (url.includes('google') && url.includes('amp')) {
        return true;
    }

    return false;
}

/**
 * assumes the string is already trimmed
 * 
 * @param {*} str 
 * @returns set of URLs
 */
export function extractAmpUrls(str) {
    const words = str.split(/\s+/); // for untrimmed strings: str.trim().split(/\s+/);
    const URLs = new Set();

    for (let i = 0, n = words.length; i < n; i++) {
        const word = words[i];
        if (isValidURL(word) && isAMP(word)) {
            URLs.add(word);
        }
    }

    return URLs;
}

/**
 * 
 * @param {*} str 
 * @returns array of non-AMP links
 */
 export async function extractAndConvertAmpLinks(str) {
    const linkSet = extractAmpUrls(str);

    if (linkSet.size) {
        return [...(await convertAMPSet(linkSet))];
    }

    return [];
}
