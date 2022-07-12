/**
 * reduce oversized strings
 * 
 * @param {*} str 
 * @param {*} charLimit default is the discord char limit of 2000
 * @returns 
 */
export function cutOff(str, charLimit = 2000) {
    if (str.length > charLimit) {
        return `${str.substring(0, charLimit - 3)}...`;
    }

    return str;
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} separator tag separator
 * @param {*} whitespace whitespace replacement
 * @returns 
 */
export function tagArrToStr(tagArr, separator, whitespace = ' ') {
    return tagArrToParsedTagArr(tagArr, whitespace).join(encodeURIComponent(separator));
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement
 * @returns 
 */
export function tagArrToParsedTagArr(tagArr, whitespace = ' ') {
    if (whitespace === ' ') {
        for (let i = 0, n = tagArr.length; i < n; i++) {
            tagArr[i] = encodeURIComponent(tagArr[i].trim());
        }
    }
    else {
        for (let i = 0, n = tagArr.length; i < n; i++) {
            tagArr[i] = encodeURIComponent(tagArr[i].trim().replaceAll(' ', whitespace));
        }
    }

    return tagArr;
}

/**
 * escapes regex
 * 
 * @param {*} str 
 * @returns 
 */
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * removes all non alphabet, number, and space chars
 * 
 * @param {*} str 
 * @returns 
 */
export function removeAllSpecialChars(str) {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
}

/**
 * check if a phrase appears in a string
 * 
 * @param {*} str 
 * @param {*} phrase 
 * @param {*} caseSensitive 
 * @returns 
 */
export function includesPhrase(str, phrase, caseSensitive = true) {
    const escapedWord = `\\b${escapeRegex(phrase)}\\b`;

    if (caseSensitive) {
        return new RegExp(escapedWord).test(str);
    }

    return new RegExp(escapedWord, 'i').test(str);
}

/**
 * removes mentions, the bot's name, and special characters from the message
 * 
 * @param {*} msgStr message
 * @param {*} botName bot's name
 * @returns 
 */
export function removeMentions(msgStr, botName = '') {
    let noMentions = msgStr.replaceAll(/(<(#|(@(!|&)?))\d{1,}>)|(@((here)|(everyone)))/ig, '');

    if (botName.length) {
        // used for names that may contain regex chars
        // const escapedName = `\\b${escapeRegex(botName)}\\b`;
        // const nameRegex = new RegExp(escapedName, 'ig');
        // noMentions = noMentions.replaceAll(nameRegex, '');

        // used for names that never need to be escaped
        noMentions = noMentions.replaceAll(new RegExp(`\\b${botName}\\b`, 'ig'), '');
    }

    return noMentions.trim();
}

/**
 * 
 * @param {*} n 
 * @returns string of at least length 2
 */
export function numberLengthFormat(n) {
    if (n < 10) {
        return `0${n}`;
    }

    return n;
}

/**
 * 
 * @param {*} ms 
 * @returns hh:mm:ss
 */
export function timeFormat(ms) {
    ms = Math.trunc(ms / 1000);
    const s = ms % 60;
    ms = Math.trunc(ms / 60);
    const min = ms % 60;
    const hr = Math.trunc(ms / 60);

    return `${numberLengthFormat(hr)}:${numberLengthFormat(min)}:${numberLengthFormat(s)}`;
}

const oneKilobyte = Math.pow(2, 10);
const byteUnits = [
    'Bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB'
];

/**
 * converts n bytes into the a string of highest byte unit it can be represented by that is not less than 1 unit
 * 
 * @param {*} bytes 
 * @param {*} precision 
 * @returns 
 */
export function byteFormat(bytes, precision = 2) {
    if (bytes <= 0) {
        return `0 ${byteUnits[0]}`;
    }

    if (precision < 0) {
        precision = 0;
    }

    const power = Math.trunc(Math.log(bytes) / Math.log(oneKilobyte));

    return `${parseFloat((bytes / Math.pow(oneKilobyte, power)).toFixed(precision))} ${byteUnits[power]}`;
}
