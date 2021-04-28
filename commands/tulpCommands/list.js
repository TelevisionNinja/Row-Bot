import { default as tulpConfig } from './tulpConfig.json';
import { tulp as tulpCollection } from '../../lib/database.js';

const listConfig = tulpConfig.list;

export default {
    names: listConfig.names,
    description: listConfig.description,
    argsRequired: false,
    argsOptional: false,
    guildOnly: false,
    usage: '',
    async execute(msg, args) {
        const query = { _id: msg.author.id };
        const userData = await tulpCollection.findOne(query);

        if (userData === null) {
            msg.channel.send(listConfig.noTulpsMsg);
            return;
        }

        msg.channel.send({
            embed: {
                title: 'Your tulps', 
                description: userData.tulps.map(t => `• ${t.username}`).join('\n')
            }
        });
    }
}