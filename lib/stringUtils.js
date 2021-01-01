const { tagSeparator } = require('../config.json');

module.exports = {
    trim,
    tagsToStr,
    tagsToParsedTagArr,
    cutOff,
    tagArrToStr,
    tagArrToParsedTagArr
}

/**
 * trims a specified character from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimChar char that will be trimed off of the str
 */
function trim(str, trimChar) {
    const length = str.length;
    let end = length;
    while (end > 0) {
        if (str[end - 1] !== trimChar) {
            break;
        }

        end--;
    }

    if (end === 0) {
        return '';
    }

    let start = 0;
    while (start < end) {
        if (str[start] !== trimChar) {
            break;
        }

        start++;
    }

    if (end === length) {
        if (start) {
            return str.substring(start);
        }

        return str;
    }

    return str.substring(start, end);
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement
 * @param {*} separator tag separator
 */
function tagsToStr(tagArr, whitespace, separator) {
    let tagStr = tagArr.join(whitespace);
    
    tagArr = tagStr.split(tagSeparator);

    let tagSet = new Set();

    for (let i = 0, n = tagArr.length; i < n; i++) {
        const tag = trim(tagArr[i], whitespace);
        if (tag !== '') {
            tagSet.add(tag);
        }
    }
    
    return [...tagSet].join(separator);
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement
 */
function tagsToParsedTagArr(tagArr, whitespace) {
    let tagStr = tagArr.join(whitespace);
    
    tagArr = tagStr.split(tagSeparator);

    let tagSet = new Set();

    for (let i = 0, n = tagArr.length; i < n; i++) {
        const tag = trim(tagArr[i], whitespace);
        if (tag !== '') {
            tagSet.add(tag);
        }
    }
    
    return [...tagSet];
}

function cutOff(str, charLimit) {
    if (str.length > charLimit) {
        return `${str.substring(0, charLimit - 3)}...`;
    }
    
    return str;
}

//------------------------------------------------------------------------

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