import axios from 'axios';
import { randomInt } from 'crypto';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * inclusive min
 * exclusive max
 * 
 * @param {*} min 
 * @param {*} max 
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
 * inclusive min
 * exclusive max
 * 
 * @param {*} min 
 * @param {*} max 
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
 * inclusive min
 * exclusive max
 * base 10
 * 
 * @param {*} min 
 * @param {*} max 
 * @returns 
 */
export async function randomTrue(min = 0, max = 0) {
    if (max === min) {
        return max;
    }
    
    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    max--;

    const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
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
