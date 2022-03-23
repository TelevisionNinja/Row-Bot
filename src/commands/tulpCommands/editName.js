import tulpConfigFile from '../../../config/tulpConfig.json' assert { type: 'json' };
import config from '../../../config/config.json' assert { type: 'json' };
import { tulps } from '../../lib/database.js';
import { Constants } from 'discord.js';

const editName = tulpConfigFile.editName,
    tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator;

export default {
    interactionData: {
        name: editName.names[0],
        description: editName.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'old-name',
                description: 'The old name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'new-name',
                description: 'The new name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: editName.names,
    description: editName.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new name>`,
    async execute(msg, args) {
        let namesArr = args.join(' ').split(tagSeparator).map(n => n.trim());
        const oldName = namesArr[0];
        let newName = '';
        let needParameters = false;

        if (namesArr.length === 1) {
            needParameters = true;
        }
        else {
            newName = namesArr[1];
        }

        if (needParameters || !oldName.length || !newName.length || oldName === newName) {
            msg.reply(`Please provide the current name and a new name spearated by a "${tagSeparator}"`);
            return;
        }

        //-----------------------------------------------------------

        try {
            const result = await tulps.updateUsernameAndBrackets(msg.author.id, oldName, newName, `${oldName}:`, `${newName}:`, '');

            if (result.rowCount) {
                msg.reply(editName.confirmMsg);
                return;
            }
        }
        catch (nameOrBracketError) {}

        try {
            const result = await tulps.updateUsername(msg.author.id, oldName, newName);

            if (result.rowCount) {
                msg.reply(editName.confirmMsg);
            }
            else {
                msg.reply(tulpConfig.noDataMsg);
            }
        }
        catch (nameError) {
            msg.reply('That new name is already being used');
        }
    },
    async executeInteraction(interaction) {
        const newName = interaction.options.getString('new-name');
        const oldName = interaction.options.getString('old-name');

        try {
            const result = await tulps.updateUsernameAndBrackets(interaction.user.id, oldName, newName, `${oldName}:`, `${newName}:`, '');

            if (result.rowCount) {
                interaction.reply(editName.confirmMsg);
                return;
            }
        }
        catch (nameOrBracketError) {}

        try {
            const result = await tulps.updateUsername(interaction.user.id, oldName, newName);

            if (result.rowCount) {
                interaction.reply(editName.confirmMsg);
            }
            else {
                interaction.reply(tulpConfig.noDataMsg);
            }
        }
        catch (nameError) {
            interaction.reply('That new name is already being used');
        }
    }
}
