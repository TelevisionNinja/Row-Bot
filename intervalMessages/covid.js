import DailyInterval from 'daily-intervals';
import { default as config } from '../config.json';
import {
    getData,
    dataToEmbed
} from '../commands/covid.js';

const covidConfig = config.covid;

export default {
    description: covidConfig.description,
    async execute(client) {
        const interval = new DailyInterval(
            async () => {
                const data = await getData();
                let embed = dataToEmbed(covidConfig.intervalState, data);

                embed.embed.author = { name: 'Daily Covid Report' };

                client.send(covidConfig.intervalChannel, embed);
            },
            covidConfig.intervalTime,
            1440, // 24 hrs in minutes
            5000 // 5 second offset
        );

        interval.start();
    }
}