import tulpConfigFile from '../../../config/tulpConfig.json' with { type: 'json' };
import config from '../../../config/config.json' with { type: 'json' };
import { tulps } from '../../lib/database.js';
import { ApplicationCommandOptionType } from 'discord.js';

const info = tulpConfigFile.info,
    tulpConfig = config.tulp;

export default {
    interactionData: {
        name: info.names[0],
        description: info.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: ApplicationCommandOptionType.String
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
        const selectedTulp = await tulps.getInfo(msg.author.id, username);

        if (typeof selectedTulp === 'undefined') {
            msg.reply(tulpConfig.noDataMsg);
            return;
        }

        msg.reply({
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
        const selectedTulp = await tulps.getInfo(interaction.user.id, username);

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
