const { tagSeparator } = require('../config.json');

module.exports = {
    trim,
    tagsToStr,
    tagsToArr
}

function trim(str, trimStr) {
    const length = str.length;
    let end = length;
    let start = 0;

    for (let x = 0; x === start || x === length - end; x++) {
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

    for (let x = 0, n = tagArr.length; x < n; x++) {
        const tag = trim(tagArr[x], whitespace);
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

    for (let x = 0, n = tagArr.length; x < n; x++) {
        const tag = trim(tagArr[x], whitespace);
        if (tag !== '') {
            tagSet.add(tag);
        }
    }
    
    return [...tagSet];
}