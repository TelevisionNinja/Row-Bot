import { default as config } from '../config.json';
import { default as tulpCache } from '../lib/tulpCache.js';

const tulp = config.tulp,
    prefix = config.prefix;

export default {
    names: tulp.names,
    description: tulp.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: '<tulp command>',
    cooldown: 0,
    execute(msg, args) {
        // get command
        const userCommand = args.shift().toLowerCase();
        const command = msg.client.tulpCommands.get(userCommand);

        //--------------------------------------------------------------------------------

        if (typeof command === 'undefined') {
            return;
        }

        if (command.guildOnly && msg.channel.type === 'DM') {
            msg.channel.send('I can\'t execute that command in DM\'s');
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.channel.send(`Please provide arguments\nex: \`${prefix}${tulp.names[0]} ${command.names[0]} ${command.usage}\``);
            return;
        }

        tulpCache.remove(msg.author.id);

        //--------------------------------------------------------------------------------
        // execute command

        try {
            command.execute(msg, args);
        }
        catch (error) {
            msg.channel.send('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }
    }
}