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
    isValidURL,
    containsURL
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
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const prohibitedCharsRegex = new RegExp(`[^a-zA-Z0-9${escapeRegex(tagSeparator)}: -]`, 'g');

/**
 * returns a string with all prohibited chars removed
 * 
 * permitted chars are: 'a' to 'z', 'A' to 'Z', '0' to '9', ':', space, and the tag separator
 * 
 * @param {*} str 
 */
function removeProhibitedChars(str) {
    return str.replace(prohibitedCharsRegex, '');
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

//--------------------------------------------------------------------

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const isValidURLRegex = new RegExp(/^(https?:\/\/)((\w{0,}\w)\.(\w{1,}\w)|(\w{0,}\w))\.(\w{1,}\w)/i);

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
function isValidURL(str) {
    return isValidURLRegex.test(str);
}

//--------------------------------------------------------------------

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const containsURLRegex = new RegExp(/(https?:\/\/)((\w{0,}\w)\.(\w{1,}\w)|(\w{0,}\w))\.(\w{1,}\w)/i);

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
function containsURL(str) {
    return containsURLRegex.test(str);
}