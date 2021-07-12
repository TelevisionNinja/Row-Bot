import { default as tulpConfig } from './tulpConfig.json';
import { tulps } from '../../lib/database.js';

const listConfig = tulpConfig.list;

export default {
    names: listConfig.names,
    description: listConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const tulpNames = await tulps.listAll(msg.author.id);

        if (tulpNames.length) {
            msg.channel.send({
                embeds: [{
                    title: 'Your tulps',
                    description: tulpNames.map(t => `• ${t.username}`).join('\n')
                }]
            });
        }
        else {
            msg.channel.send(listConfig.noTulpsMsg);
        }
    }
}