const { tagSeparator } = require('../config.json');

module.exports = {
    trimChar,
    trimSubstr,
    cutOff,
    tagArrToStr,
    tagArrToParsedTagArr,
    removeProhibitedChars,
    replaceHTMLEntities,
    removeAllSpecialChars,
    isValidURL
}

/**
 * trims a specified character from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimChar char that will be trimed off of the str
 */
function trimChar(str, trimChar) {
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
function trimSubstr(str, trimSubstr) {
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

function cutOff(str, charLimit) {
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
function tagArrToStr(tagArr, whitespace, separator) {
    return tagArrToParsedTagArr(tagArr, whitespace).join(separator);
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement
 * @param {*} separator tag separator
 */
function tagArrToParsedTagArr(tagArr, whitespace) {
    let tagSet = new Set();

    for (let i = 0, n = tagArr.length; i < n; i++) {
        const tag = tagArr[i].trim().replaceAll(' ', whitespace);
        
        if (tag !== '') {
            tagSet.add(tag);
        }
    }
    
    return [...tagSet];
}

/**
 * escapes regex
 * 
 * @param {*} str 
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * returns a string with all prohibited chars removed
 * 
 * permitted chars are: 'a' to 'z', 'A' to 'Z', '0' to '9', ':', space, and the tag separator
 * 
 * @param {*} str 
 */
function removeProhibitedChars(str) {
    return str.replace(
        new RegExp(`[^a-zA-Z0-9: ${escapeRegex(tagSeparator)}]`, 'g'),
        ''
    );
}

/**
 * replaces html entities with their character equivalent
 * 
 * @param {*} str 
 */
function replaceHTMLEntities(str) {
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
function removeAllSpecialChars(str) {
    return str.replace(/[^a-zA-Z0-9 ]/g, '');
}

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
function isValidURL(str) {
    // scheme of 'http' or 'https'
    // /^(https?:((\/|\\))((\/|\\)))/i
    const scheme = new RegExp(/^(https?:\/\/)/i);

    if (!scheme.test(str)) {
        return false;
    }

    // split website into its parts, ex: ['www', 'example', 'com']
    const websiteParts = str.split('/')[2].split('.');

    const websitePartsLen = websiteParts.length;

    // check if the top level domain is of 2 or more characters
    if (websitePartsLen < 2 || websiteParts[websitePartsLen - 1].length < 2) {
        return false;
    }

    return true;
}