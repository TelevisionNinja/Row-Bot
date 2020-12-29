const { tagSeparator } = require('../config.json');

module.exports = {
    trim,
    tagsToStr,
    tagsToArr,
    cutOff
}

function trim(str, trimStr) {
    const length = str.length;
    let end = length;
    let start = 0;

    for (let i = 0; i === start || i === length - end; i++) {
        const newEnd = end - 1;

        if (str[newEnd] === trimStr) {
            end = newEnd;
        }
        if (str[start] === trimStr) {
            start++;
        }
    }

    if (start < end) {
        if (end === length) {
            if (start) {
                return str.substring(start);
            }

            return str;
        }
        
        return str.substring(start, end);
    }

    return '';
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