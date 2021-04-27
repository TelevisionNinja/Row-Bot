import { default as tulpConfigFile } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { tulp as tulpCollection } from '../../lib/database.js';

const info = tulpConfigFile.info,
    tulpConfig = config.tulp;

export default {
    names: info.names,
    description: info.description,
    argsRequired: true,
    argsOptional: false,
    guildOnly: false,
    usage: '<name>',
    async execute(msg, args) {
        const username = args.join(' ').trim();
        const query = { _id: msg.author.id };
        const options = {
            projection: {
                tulps: {
                    $elemMatch: {
                        username: username
                    }
                }
            }
        }
        const userData = await tulpCollection.findOne(query, options);

        if (userData === null) {
            msg.channel.createMessage(tulpConfig.notUserMsg);
            return;
        }

        if (typeof userData.tulps === 'undefined') {
            msg.channel.createMessage(tulpConfig.noDataMsg);
            return;
        }

        const selectedTulp = userData.tulps[0];

        msg.channel.createMessage({
            embed: {
                title: selectedTulp.username,
                thumbnail: { url: selectedTulp.avatar },
                fields: [
                    {
                        name: 'Brackets',
                        value: `${selectedTulp.startBracket}text${selectedTulp.endBracket}`
                    }
                ]
            }
        });
    }
}