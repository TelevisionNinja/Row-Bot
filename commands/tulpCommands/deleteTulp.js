import { default as tulpConfig } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { tulp as tulpCollection } from '../../lib/database.js';

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
        const query = {
            _id: msg.author.id,
            'tulps.username': username
        };
        const update = {
            $pull: {
                tulps: {
                    username: username
                }
            }
        };
        const result = await tulpCollection.updateOne(query, update);

        if (result.result.n) {
            msg.channel.createMessage(deleteTulp.confirmMsg);

            const deleteQuery = {
                _id: msg.author.id,
                tulps: {
                    $size: 0
                }
            };

            tulpCollection.deleteOne(deleteQuery);
        }
        else {
            msg.channel.createMessage(tulpConfigObj.noDataMsg);
        }
    }
}