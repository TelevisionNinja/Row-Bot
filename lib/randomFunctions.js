import axios from 'axios';
import { randomInt } from 'crypto';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

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

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive incusive or exclusive max
 * @param {*} base 
 * @returns 
 */
export async function randomTrue(min = 0, max = 0, inclusive = false, base = 10) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    if (!inclusive) {
        max--;
    }

    const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=${base}&format=plain&rnd=new`;
    let result = 0;

    await queue.add(async () => {
        try {
            const response = await axios.get(url);
            result = response.data;
        }
        catch (error) {
            backOff(error, queue);
        }
    });

    return result;
}
