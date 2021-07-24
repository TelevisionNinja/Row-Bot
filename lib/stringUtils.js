/**
 * trims a specified character from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimChar char that will be trimed off of the str
 */
export function trimChar(str, trimChar) {
    let end = str.length;
    while (end) {
        if (str[--end] !== trimChar) {
            ++end;
            break;
        }
    }

    if (!end) {
        return '';
    }

    let start = 0;
    while (str[start] === trimChar) {
        ++start;
    }

    return str.substring(start, end);
}

/**
 * trims a substring from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimSubstr substring that will be trimed off of the str
 * @returns 
 */
export function trimSubstr(str, trimSubstr) {
    const substrLen = trimSubstr.length;
    let end = str.length;

    if (!substrLen || end < substrLen) {
        return str;
    }

    let strIndex = end;
    let subStrIndex = substrLen;
    while (strIndex && str[--strIndex] === trimSubstr[--subStrIndex]) {
        if (!subStrIndex) {
            end = strIndex;
            subStrIndex = substrLen;
        }
    }

    if (!end) {
        return '';
    }

    let start = 0;
    strIndex = 0;
    subStrIndex = 0;
    while (str[strIndex] === trimSubstr[subStrIndex]) {
        ++strIndex;

        if (++subStrIndex === substrLen) {
            start = strIndex;
            subStrIndex = 0;
        }
    }

    return str.substring(start, end);
}

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
 * @param {*} whitespace whitespace replacement
 * @param {*} separator tag separator
 */
export function tagArrToStr(tagArr, whitespace, separator) {
    return tagArrToParsedTagArr(tagArr, whitespace).join(separator);
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement
 * @param {*} separator tag separator
 */
export function tagArrToParsedTagArr(tagArr, whitespace) {
    for (let i = 0, n = tagArr.length; i < n; i++) {
        tagArr[i] = tagArr[i].trim().replaceAll(' ', whitespace);
    }

    return tagArr;
}

/**
 * escapes regex
 * 
 * @param {*} str 
 */
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * replaces html entities with their character equivalent
 * 
 * @param {*} str 
 */
export function replaceHTMLEntities(str) {
    return str.replaceAll('&quot;', '"')
        .replaceAll('&#39;', '\'')
        .replaceAll('&apos;', '\'')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
}

/**
 * removes all non alphabet, number, and space chars
 * 
 * @param {*} str 
 */
export function removeAllSpecialChars(str) {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
}

//--------------------------------------------------------------------

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const isValidURLRegex = new RegExp(/^(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})/i);

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

//--------------------------------------------------------------------

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const containsURLRegex = new RegExp(/(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})/i);

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
export function removeMentions(msgStr, botName) {
    return removeAllSpecialChars(msgStr.replaceAll(/(<@(\d|!|&)(\d){1,}>)|(@((here)|(everyone)))/g, ''))
        .replace(botName, '')
        .trim();
}