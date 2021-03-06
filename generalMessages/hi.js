import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';
import { default as config } from '../config.json';

const names = config.names.map(n => n.toLowerCase()),
    greetings = messages.greetings;

export default {
    description: 'Say hi',
    execute(msg, filteredMsg) {
        const numOfGreetings = greetings.length;

        for (let i = 0; i < numOfGreetings; i++) {
            if (filteredMsg === greetings[i].toLowerCase()) {
                return greetings[randomMath(numOfGreetings)];
            }
        }

        for (let i = 0, n = names.length; i < n; i++) {
            if (filteredMsg === names[i]) {
                return greetings[randomMath(numOfGreetings)];
            }
        }

        return '';
    }
}