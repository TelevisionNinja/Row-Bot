import config from '../config.json' assert { type: 'json' };
import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { Constants } from 'discord.js';

const stock = config.stock;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

// yahoo finance
const priceElement = 'Fw(b) Fz(36px) Mb(-4px) D(ib)';
const valueStr = 'value="';

export default {
    interactionData: {
        name: stock.names[0],
        description: stock.description,
        options: [
            {
                name: 'symbol',
                description: 'The symbol of the stock',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: stock.names,
    description: stock.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: true,
    guildOnly: false,
    usage: '<symbol>',
    cooldown: 1,
    async execute(msg, args) {
        const symbol = args[0];
        const price = await getStockStr(symbol);

        if (price.length) {
            msg.channel.send(`$${price}`);
        }
        else {
            msg.channel.send('I couldn\'t find that stock');
        }
    },
    async executeInteraction(interaction) {
        await interaction.deferReply();

        const symbol = interaction.options.getString('symbol');
        const price = await getStockStr(symbol);

        if (price.length) {
            interaction.editReply(`$${price}`);
        }
        else {
            interaction.editReply('I couldn\'t find that stock');
        }
    }
}

/**
 * 
 * @param {*} symbol stock symbol
 * @returns price (string)
 */
async function getStockStr(symbol) {
    let price = '';

    await queue.add(async () => {
        const response = await fetch(`${stock.API}${encodeURIComponent(symbol)}`);

        if (backOff(response, queue)) {
            return;
        }

        const str = await response.text();

        price = str.substring(str.indexOf(priceElement) + priceElement.length);
        price = price.substring(price.indexOf('>') + 1, price.indexOf('<'));
    });

    return price;
}

/**
 * 
 * @param {*} symbol stock symbol
 * @returns price (float)
 */
export async function getStock(symbol) {
    let price = 0.0;

    await queue.add(async () => {
        const response = await fetch(`${stock.API}${encodeURIComponent(symbol)}`);

        if (backOff(response, queue)) {
            return;
        }

        const str = await response.text();
        let priceStr = str.substring(str.indexOf(priceElement) + priceElement.length);

        const strtingIndex = priceStr.indexOf(valueStr) + valueStr.length;
        priceStr = priceStr.substring(strtingIndex, priceStr.indexOf('"', strtingIndex));

        price = parseFloat(priceStr);
    });

    return price;
}
