import config from '../../config/config.json' assert { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const timeConfig = config.time;

export default {
    interactionData: {
        name: timeConfig.names[0],
        description: timeConfig.description,
        options: [
            {
                name: 'time',
                description: 'hours:minutes',
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
    usage: '<hours:minutes>',
    cooldown: 0,
    async execute(msg, args) {
        const timeArr = args.join('').split(':').map(number => parseInt(number.trim()));

        if (timeArr.length !== 2 || isNaN(timeArr[0]) || isNaN(timeArr[1])) {
            msg.reply('Enter the time in the correct 24 hour format: `hours:minutes`');
        }
        else {
            const time = new Date();
            time.setHours(...timeArr);
            msg.reply(`<t:${Math.trunc(time.valueOf() / 1000)}:t>`);
        }
    },
    async executeInteraction(interaction) {
        const timeStr = interaction.options.getString('time');
        const timeArr = timeStr.split(':').map(number => parseInt(number.trim()));

        if (timeArr.length !== 2 || isNaN(timeArr[0]) || isNaN(timeArr[1])) {
            interaction.reply('Enter the time in the correct 24 hour format: `hours:minutes`');
        }
        else {
            const time = new Date();
            time.setHours(...timeArr);
            interaction.reply(`<t:${Math.trunc(time.valueOf() / 1000)}:t>`);
        }
    }
}
