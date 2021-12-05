/**
 * reduce oversized strings
 * 
 * @param {*} str 
 * @param {*} charLimit 
 * @returns 
 */
export function cutOff(str, charLimit) {
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
        noMentions = noMentions.replaceAll(botName, '');
    }

    return noMentions.trim();
}
