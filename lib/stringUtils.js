module.exports = {
    trim,
}

function trim(str, trimStr) {
    let end = str.length;
    for (; end > 0; end--) {
        if (str[end - 1] !== trimStr) {
            break;
        }
    }

    if (end === 0) {
        return '';
    }

    let start = 0;
    for (; start < end; start++) {
        if (str[start] !== trimStr) {
            break;
        }
    }

    if (end === str.length) {
        if (start) {
            return str.substring(start);
        }

        return str;
    }

    return str.substring(start, end);
}