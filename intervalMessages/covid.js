import DailyInterval from 'daily-intervals';
import { getRecipient } from '../lib/msgUtils.js';
import { default as config } from '../config.json';
import {
    getData,
    dataToEmbed
} from '../commands/covid.js';

const covidConfig = config.covid;

export default {
    description: covidConfig.description,
    async execute(client) {
        const recipient = await getRecipient(client, covidConfig.intervalChannel);

        const interval = new DailyInterval(
            async () => {
                const data = await getData();
                let embed = dataToEmbed(covidConfig.intervalState, data);

                embed.embeds[0].author = { name: 'Daily Covid Report' };

                recipient.send(embed);
            },
            covidConfig.intervalTime,
            1440, // 24 hrs in minutes
            5000 // 5 second offset
        );

        interval.start();
    }
}