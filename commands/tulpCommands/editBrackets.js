import tulpConfigFile from '../../config/tulpConfig.json' assert { type: 'json' };
import config from '../../config/config.json' assert { type: 'json' };
import { tulps } from '../../lib/database.js';
import { Constants } from 'discord.js';

const editBrackets = tulpConfigFile.editBrackets,
    enclosingText = editBrackets.enclosingText,
    tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator;

const errorMessage = `Please provide a name followed by a "${tagSeparator}" and then the new brackets enclosing the word "${enclosingText}". "${tagSeparator}" are not allowed in brackets`;

export default {
    interactionData: {
        name: editBrackets.names[0],
        description: editBrackets.description,
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        options: [
            {
                name: 'name',
                description: 'The name',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'brackets',
                description: `<new_bracket>${enclosingText}<new_bracket>`,
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    },
    names: editBrackets.names,
    description: editBrackets.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new_bracket>${enclosingText}<new_bracket>`,
    async execute(msg, args) {
        const params = args.join(' ').split(tagSeparator).map(s => s.trim());

        if (params.length < 2) {
            msg.reply(errorMessage);
            return;
        }

        const unparsedBrackets = params[1];

        if (unparsedBrackets.indexOf(enclosingText) === -1) {
            msg.reply(errorMessage);
            return;
        }

        const bracketArr = unparsedBrackets.split(enclosingText).map(b => b.trim());

        if (!bracketArr.length) {
            msg.reply(errorMessage);
            return;
        }

        const startBracket = bracketArr[0];
        const endBracket = bracketArr[1];

        if (!startBracket.length && !endBracket.length) {
            msg.reply('Brackets can\'t be empty');
            return;
        }

        try {
            const result = await tulps.updateBrackets(msg.author.id, params[0], startBracket, endBracket);

            if (result.rowCount) {
                msg.reply(editBrackets.confirmMsg);
            }
            else {
                msg.reply(tulpConfig.noDataMsg);
            }
        }
        catch (error) {
            msg.reply('These brackets are already being used');
        }
    },
    async executeInteraction(interaction) {
        const unparsedBrackets = interaction.options.getString('brackets');
        const username = interaction.options.getString('name');

        if (unparsedBrackets.indexOf(enclosingText) === -1) {
            interaction.reply(errorMessage);
            return;
        }

        const bracketArr = unparsedBrackets.split(enclosingText).map(b => b.trim());

        if (!bracketArr.length) {
            interaction.reply(errorMessage);
            return;
        }

        const startBracket = bracketArr[0];
        const endBracket = bracketArr[1];

        if (!startBracket.length && !endBracket.length) {
            interaction.reply('Brackets can\'t be empty');
            return;
        }

        try {
            const result = await tulps.updateBrackets(interaction.user.id, username, startBracket, endBracket);

            if (result.rowCount) {
                interaction.reply(editBrackets.confirmMsg);
            }
            else {
                interaction.reply(tulpConfig.noDataMsg);
            }
        }
        catch (error) {
            interaction.reply('These brackets are already being used');
        }
    }
}
