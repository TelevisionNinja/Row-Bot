module.exports = {
    hasSubArrInOrder,
    hasSubArr
}

/**
 * returns a boolean for whether the main array constains a subset that is in the same order as the sub array
 * 
 * @param {*} arr 
 * @param {*} subArr 
 */
function hasSubArrInOrder(arr, subArr) {
    const subLen = subArr.length;

    // empty set
    if (!subLen) {
        return true;
    }

    for (let i = 0, n = arr.length; subLen <= n - i; i++) {
        if (arr[i] === subArr[0]) {
            let j = 0;

            while (j < subLen && arr[i + j] === subArr[j]) {
                j++;
            }

            if (j === subLen) {
                return true;
            }
        }
    }

    return false;
}

/**
 * returns a boolean for whether the sub array is a subset of the main array
 * 
 * @param {*} arr 
 * @param {*} subArr 
 */
function hasSubArr(arr, subArr) {
    return subArr.every(element => arr.includes(element));
}
