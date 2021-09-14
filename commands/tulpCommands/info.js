import { default as tulpConfigFile } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { tulps } from '../../lib/database.js';
import { Constants } from 'discord.js';

const info = tulpConfigFile.info,
    tulpConfig = config.tulp;

export default {
    interactionData: {
        name: info.names[0],
        description: info.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: info.names,
    description: info.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const username = args.join(' ').trimStart();
        const selectedTulp = await tulps.get(msg.author.id, username);

        if (typeof selectedTulp === 'undefined') {
            msg.channel.send(tulpConfig.noDataMsg);
            return;
        }

        msg.channel.send({
            embeds: [{
                title: selectedTulp.username,
                thumbnail: { url: selectedTulp.avatar },
                fields: [
                    {
                        name: 'Brackets',
                        value: `${selectedTulp.start_bracket}text${selectedTulp.end_bracket}`
                    }
                ]
            }]
        });
    },
    async executeInteraction(interaction) {
        const username = interaction.options.getString('name');
        const selectedTulp = await tulps.get(interaction.user.id, username);

        if (typeof selectedTulp === 'undefined') {
            interaction.reply(tulpConfig.noDataMsg);
            return;
        }

        interaction.reply({
            embeds: [{
                title: selectedTulp.username,
                thumbnail: { url: selectedTulp.avatar },
                fields: [
                    {
                        name: 'Brackets',
                        value: `${selectedTulp.start_bracket}text${selectedTulp.end_bracket}`
                    }
                ]
            }]
        });
    }
}
