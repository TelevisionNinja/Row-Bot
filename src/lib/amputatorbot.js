import PQueue from 'p-queue';
import { backOff } from './urlUtils.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * 
 * @param {*} array url array
 * @param {*} guessAndCheck 
 * @param {*} maxDepth 
 * @returns 
 */
export async function getCanonicals(array, guessAndCheck = true, maxDepth = 3) {
    let canonicals = [];

    if (array.length) {
        await queue.add(async () => {
            const response = await fetch(`https://www.amputatorbot.com/api/v1/convert?gac=${guessAndCheck}&md=${maxDepth}&q=${array.join(';')}`);
    
            if (backOff(response, queue)) {
                return;
            }
    
            const linkArray = await response.json();
    
            for (let i = 0; i < linkArray.length; i++) {
                const linkObject = linkArray[i];
    
                if (linkObject.canonical !== null) {
                    canonicals.push(linkObject.canonical.url);
                }
            }
        });
    }

    return canonicals;
}
