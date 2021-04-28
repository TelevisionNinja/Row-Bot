import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const greetings = messages.greetings;

const greetingsLowerCase = greetings.map(g => g.toLowerCase());

export default {
    description: 'Say hi',
    execute(msg, filteredMsg) {
        const numOfGreetings = greetings.length;

        if (!filteredMsg.length) {
            return greetings[randomMath(numOfGreetings)];
        }

        for (let i = 0; i < numOfGreetings; i++) {
            if (filteredMsg === greetingsLowerCase[i]) {
                return greetings[randomMath(numOfGreetings)];
            }
        }

        return '';
    }
}