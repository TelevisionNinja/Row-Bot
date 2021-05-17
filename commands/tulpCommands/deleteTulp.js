import { default as tulpConfig } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { tulps } from '../../lib/database.js';

const deleteTulp = tulpConfig.deleteTulp,
    tulpConfigObj = config.tulp;

export default {
    names: deleteTulp.names,
    description: deleteTulp.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const username = args.join(' ').trim();
        const result = await tulps.delete(msg.author.id, username);

        if (result.rowCount) {
            msg.channel.send(deleteTulp.confirmMsg);
        }
        else {
            msg.channel.send(tulpConfigObj.noDataMsg);
        }
    }
}