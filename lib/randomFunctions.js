import { randomInt } from 'crypto';

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive incusive or exclusive max
 * @returns 
 */
export function randomMath(min = 0, max = 0, inclusive = false) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    if (inclusive) {
        max++;
    }

    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive incusive or exclusive max
 * @returns 
 */
export function randomCrypto(min = 0, max = 0, inclusive = false) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    if (inclusive) {
        max++;
    }

    return randomInt(min, max);
}
