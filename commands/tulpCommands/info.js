import { default as tulpConfigFile } from './tulpConfig.json';
import { default as config } from '../../config.json';
import { tulps } from '../../lib/database.js';

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
    }
}