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
    usage: '<command>',
    cooldown: 0,
    execute(msg, args) {
        // get command
        const userCommand = args.shift();
        const command = msg.client.tulpCommands.find(cmd => cmd.names.includes(userCommand));

        //--------------------------------------------------------------------------------

        if (typeof command === 'undefined') {
            return;
        }

        if (command.guildOnly && msg.channel.type === 'dm') {
            msg.channel.send('I can\'t execute that command in DM\'s');
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.channel.send(`Please provide arguments\nex: \`${prefix}${tulp.names[0]} ${command.names[0]} ${command.usage}\``);
            return;
        }

        tulpCache.remove(msg.author.id);

        //--------------------------------------------------------------------------------

        const tulpArgs = msg.content.slice(prefix.length).trim().split(' ');
        tulpArgs.shift(); // remove first command
        tulpArgs.shift(); // remove second command

        //--------------------------------------------------------------------------------
        // execute command

        try {
            command.execute(msg, tulpArgs);
        }
        catch (error) {
            msg.channel.send('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }
    }
}