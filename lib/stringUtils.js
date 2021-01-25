const { tagSeparator } = require('../config.json');

module.exports = {
    trim,
    tagsToStr,
    tagsToParsedTagArr,
    cutOff,
    tagArrToStr,
    tagArrToParsedTagArr,
    removeProhibitedChars,
    replaceHTMLEntities
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
        end--;

        if (str[end] !== trimChar) {
            break;
        }
    }

    end++;

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
 * @param {*} whitespace whitespace replacement, must be a char
 * @param {*} separator tag separator
 */
function tagsToStr(tagArr, whitespace, separator) {
    return tagsToParsedTagArr(tagArr, whitespace).join(separator);
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement, must be a char
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

//------------------------------------------------------------------------

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
 * permitted chars are: 'a' to 'z', 'A' to 'Z', '0' to '9', space, and the tag separator
 * 
 * @param {*} str 
 */
function removeProhibitedChars(str) {
    return str.replace(
        new RegExp(`[^a-zA-Z0-9 ${escapeRegex(tagSeparator)}]`, 'g'),
        ''
    );
}

/**
 * replaces html entities with their character equivalent
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