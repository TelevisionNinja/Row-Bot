const DailyInterval = require('daily-intervals');
const msgUtils = require('../lib/msgUtils.js');
const { covid: covidConfig } = require('../config.json');
const covid = require('../commands/covid.js');

module.exports = {
    description: covidConfig.description,
    async execute(client) {
        const recipient = await msgUtils.getRecipient(client, covidConfig.intervalChannel);

        const interval = new DailyInterval(
            async () => {
                const data = await covid.getData();
                let embed = covid.dataToEmbed(covidConfig.intervalState, data);

                embed.setAuthor('Daily Covid Report');
                recipient.send(embed);
            },
            covidConfig.intervalTime,
            1440, // 24 hrs in minutes
            5000 // 5 second offset
        );

        interval.start();
    }
}