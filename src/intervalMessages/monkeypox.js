import { setDailyInterval } from 'daily-intervals';
import { getChannel } from '../lib/discordUtils.js';
import config from '../../config/config.json' assert { type: 'json' };
import { getEmbed } from '../commands/monkeypox.js';

const monkeypoxConfig = config.monkeypox;

// posts a daily monkeypox information embed
export async function execute(client) {
    const recipient = await getChannel(client, monkeypoxConfig.intervalChannel);

    setDailyInterval(
        async () => {
            const embed = await getEmbed(monkeypoxConfig.intervalCountry);

            embed.author = { name: 'Daily Monkeypox Cases Report' };

            recipient.send({ embeds: [embed] });
        },
        1440, // 24 hrs in minutes
        monkeypoxConfig.intervalTime
    );
}
