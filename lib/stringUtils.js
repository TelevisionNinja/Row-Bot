const { tagSeparator } = require('../config.json');

module.exports = {
    trim,
    tagsToStr,
    tagsToArr,
    cutOff
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
function tagsToArr(tagArr, whitespace) {

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