import config from '../../config/config.json' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

const activityConfig = config.activity;

const activities = new Map();
activities.set('youtube', '880218394199220334');
activities.set('poker', '755827207812677713');
activities.set('betrayal', '773336526917861400');
activities.set('fishing', '814288819477020702');
activities.set('chess', '832012774040141894');
activities.set('youtube together', '755600276941176913');
activities.set('list', `My activities:\n${[...activities.keys()].map(name => `• ${name}`).join('\n')}`);

export default {
    interactionData: {
        name: activityConfig.names[0],
        description: activityConfig.description,
        options: [
            {
                name: 'activity',
                description: 'The activity name',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: activityConfig.names,
    description: activityConfig.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: true,
    usage: '<activity>',
    cooldown: 1,
    async execute(msg, args) {
        const vc = msg.member.voice.channel;

        if (!vc) {
            msg.reply('Please join a voice channel');
            return;
        }

        const activityName = args.join(' ').toLowerCase();
        const activityID = activities.get(activityName);

        if (typeof activityID === 'undefined') {
            msg.reply('I don\'t have that activity');
            return;
        }

        if (activityName === 'list') {
            msg.reply(activityID);
            return;
        }

        //-------------------------------------------------------

        const invite = await vc.createInvite({
            targetApplication: activityID,
            targetType: 2
        });

        return msg.reply(invite.url);
    },
    async executeInteraction(interaction) {
        const vc = interaction.member.voice.channel;

        if (!vc) {
            interaction.reply('Please join a voice channel');
            return;
        }

        const activityName = interaction.options.getString('activity').toLowerCase();
        const activityID = activities.get(activityName);

        if (typeof activityID === 'undefined') {
            interaction.reply('I don\'t have that activity');
            return;
        }

        if (activityName === 'list') {
            interaction.reply(activityID);
            return;
        }

        //-------------------------------------------------------

        const invite = vc.createInvite({
            targetApplication: activityID,
            targetType: 2
        });

        await interaction.deferReply();

        return interaction.editReply((await invite).url);
    }
}
