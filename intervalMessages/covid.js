import DailyInterval from 'daily-intervals';
import { getChannel } from '../lib/msgUtils.js';
import config from '../config/config.json' assert { type: 'json' };
import { getDataEmbeds } from '../commands/covid.js';

const covidConfig = config.covid;

// posts a daily covid information embed
export async function execute(client) {
    const recipient = await getChannel(client, covidConfig.intervalChannel);

    const interval = new DailyInterval(
        async () => {
            const embeds = await getDataEmbeds(covidConfig.intervalState);

            embeds[0].author = { name: 'Daily Covid Cases Report' };
            embeds[1].author = { name: 'Daily Covid Vaccine Report' };

            recipient.send({ embeds: embeds });
        },
        covidConfig.intervalTime,
        1440, // 24 hrs in minutes
        5000 // 5 second offset
    );

    interval.start();
}
