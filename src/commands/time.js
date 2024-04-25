import config from '../../config/config.json' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const timeConfig = config.time;

export default {
    interactionData: {
        name: timeConfig.names[0],
        description: timeConfig.description,
        options: [
            {
                name: 'time',
                description: '<hours:minutes> or <-hours:minutes>',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: timeConfig.names,
    description: timeConfig.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<hours:minutes> or <-hours:minutes>',
    cooldown: 0,
    async execute(msg, args) {
        const timeArr = args.join('').split(':').map(number => parseInt(number, 10));

        if (timeArr.length !== 2 || isNaN(timeArr[0]) || isNaN(timeArr[1]) || timeArr[1] < 0) {
            msg.reply('Enter the time in the correct format: `hours:minutes` or `-hours:minutes`');
        }
        else {
            const time = new Date();

            if (timeArr[0] < 0) {
                timeArr[1] = -timeArr[1];
            }

            time.setHours(time.getHours() + timeArr[0], time.getMinutes() + timeArr[1]);
            msg.reply(`<t:${Math.trunc(time.valueOf() / 1000)}:t>`);
        }
    },
    async executeInteraction(interaction) {
        const timeStr = interaction.options.getString('time');
        const timeArr = timeStr.split(':').map(number => parseInt(number, 10));

        if (timeArr.length !== 2 || isNaN(timeArr[0]) || isNaN(timeArr[1]) || timeArr[1] < 0) {
            interaction.reply('Enter the time in the correct format: `hours:minutes` or `-hours:minutes`');
        }
        else {
            const time = new Date();

            if (timeArr[0] < 0) {
                timeArr[1] = -timeArr[1];
            }

            time.setHours(time.getHours() + timeArr[0], time.getMinutes() + timeArr[1]);
            interaction.reply(`<t:${Math.trunc(time.valueOf() / 1000)}:t>`);
        }
    }
}
