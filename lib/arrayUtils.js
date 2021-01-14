module.exports = {
    isSubArrInOrder,
    isSubArr
}

/**
 * returns a boolean for whether the main array constains a subset that is in the same order as the sub array
 * 
 * @param {*} arr 
 * @param {*} subArr 
 */
function isSubArrInOrder(arr, subArr) {
    const subLen = subArr.length;

    // empty set
    if (!subLen) {
        return true;
    }

    for (let i = 0, n = arr.length; subLen <= n - i; i++) {
        if (arr[i] === subArr[0]) {
            let j = 0; 

            while (j < subLen) {
                if (arr[i + j] !== subArr[j]) {
                    break;
                }

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
function isSubArr(arr, subArr) {
    return subArr.every(element => arr.includes(element));
}
