import { default as tulpConfigFile } from'./tulpConfig.json';
import { default as config } from '../../config.json';
import { tulps } from '../../lib/database.js';

const editName = tulpConfigFile.editName,
    tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator;

export default {
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
            msg.channel.send(`Please provide the current name and a new name spearated by a "${tagSeparator}"`);
            return;
        }

        //-----------------------------------------------------------

        try {
            const result = await tulps.updateUsernameAndBrackets(msg.author.id, oldName, newName, `${oldName}:`, `${newName}:`, '');

            if (result.rowCount) {
                msg.channel.send(editName.confirmMsg);
                return;
            }
        }
        catch (nameOrBracketError) {}

        try {
            const result = await tulps.updateUsername(msg.author.id, oldName, newName);

            if (result.rowCount) {
                msg.channel.send(editName.confirmMsg);
            }
            else {
                msg.channel.send(tulpConfig.noDataMsg);
            }
        }
        catch (nameError) {
            msg.channel.send('That new name is already being used');
        }
    }
}