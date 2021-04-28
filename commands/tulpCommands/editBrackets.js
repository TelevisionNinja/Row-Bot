import { default as tulpConfigFile } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { tulp as tulpCollection } from '../../lib/database.js';

const editBrackets = tulpConfigFile.editBrackets,
    enclosingText = editBrackets.enclosingText,
    tulpConfig = config.tulp,
    tagSeparator = config.tagSeparator;

export default {
    names: editBrackets.names,
    description: editBrackets.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: `<name>${tagSeparator} <new_bracket>${enclosingText}<new_bracket>`,
    async execute(msg, args) {
        const params = args.join(' ').split(tagSeparator).map(s => s.trim());
        const errorMessage = `Please provide a name followed by a "${tagSeparator}" and then the new brackets enclosing the word "${enclosingText}". "${tagSeparator}" are not allowed in brackets`;

        if (params.length < 2) {
            msg.channel.send(errorMessage);
            return;
        }

        const unparsedBrackets = params[1];

        if (unparsedBrackets.indexOf(enclosingText) === -1) {
            msg.channel.send(errorMessage);
            return;
        }

        const bracketArr = unparsedBrackets.split(enclosingText).map(b => b.trim());

        if (!bracketArr.length) {
            msg.channel.send(errorMessage);
            return;
        }

        const startBracket = bracketArr[0];
        const endBracket = bracketArr[1];

        if (!startBracket.length && !endBracket.length) {
            msg.channel.send('Brackets can\'t be empty');
            return;
        }

        const checkQuery = {
            _id: msg.author.id,
            'tulps.startBracket': startBracket,
            'tulps.endBracket': endBracket
        };
        const existing = await tulpCollection.countDocuments(checkQuery, { limit: 1 });

        if (existing) {
            msg.channel.send('These brackets are already being used');
            return;
        }

        const username = params[0];
        const updateQuery = {
            _id: msg.author.id,
            'tulps.username': username
        };
        const update = {
            $set: {
                'tulps.$.startBracket': startBracket,
                'tulps.$.endBracket': endBracket
            }
        };
        const result = await tulpCollection.updateOne(updateQuery, update);

        if (result.result.n) {
            msg.channel.send(editBrackets.confirmMsg);
        }
        else {
            msg.channel.send(tulpConfig.noDataMsg);
        }
    }
}