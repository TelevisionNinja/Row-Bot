const interval = require('../lib/interval.js');
const msgUtils = require('../lib/msgUtils.js');
const { covid: covidConfig } = require('../config.json');
const covid = require('../commands/covid.js');

module.exports = {
    description: covidConfig.description,
    async execute(client) {
        const time = covidConfig.intervalTime.split(':').map(i => parseInt(i));

        const recipient = await msgUtils.getRecipient(client, covidConfig.intervalChannel);

        interval.startIntervalFunc(
            async () => {
                const data = await covid.getData();
                let embed = covid.dataToEmbed(covidConfig.intervalState, data);

                embed.setAuthor('Daily Covid Report');
                recipient.send(embed);
            },
            1440,
            time[0],
            time[1]
        );
    }
}