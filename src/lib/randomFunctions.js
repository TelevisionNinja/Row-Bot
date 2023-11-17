import { randomInt } from 'crypto';

/**
 * uses Math.random()
 * 
 * @param {*} min inclusive min
 * @param {*} max exclusive max
 * @returns 
 */
export function randomMath(min = 0, max = 0) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * uses randomInt()
 * 
 * @param {*} min inclusive min
 * @param {*} max exclusive max
 * @returns 
 */
export function randomCrypto(min = 0, max = 0) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return randomInt(min, max);
}

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max exclusive max
 * @returns 
 */
export function randomInteger(min = 0, max = 0) {
    try {
        return randomCrypto(min, max);
    }
    catch (error) {
        return randomMath(min, max);
    }
}
