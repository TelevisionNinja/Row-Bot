import { default as config } from '../config.json';
import axios from 'axios';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const stock = config.stock;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 10
});

// yahoo finance
const priceElement = 'Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)';

export default {
    names: stock.names,
    description: stock.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: true,
    guildOnly: false,
    usage: '<symbol>',
    cooldown: 1,
    async execute(msg, args) {
        const symbol = args[0];
        const price = await getStock(symbol);

        if (price) {
            msg.channel.send(`$${price}`);
        }
        else {
            msg.channel.send('I couldn\'t find that stock');
        }
    }
}

/**
 * 
 * @param {*} symbol stock symbol
 * @returns 
 */
export async function getStock(symbol) {
    let price = 0.0;

    await queue.add(async () => {
        try {
            const response = await axios.get(`${stock.API}${symbol}`);
            const str = response.data;
            let priceStr = str.substring(str.indexOf(priceElement) + priceElement.length);

            price = parseFloat(priceStr.substring(priceStr.indexOf('>') + 1, priceStr.indexOf('<')));
        }
        catch (error) {
            backOff(error, queue);
        }
    });

    return price;
}