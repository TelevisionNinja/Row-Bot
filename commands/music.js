import { default as config } from '../config.json';
import { vcCheck } from '../lib/audio.js';

const music = config.music,
    prefix = config.prefix;

export default {
    names: music.names,
    description: music.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: true,
    usage: '<music command>',
    cooldown: 0,
    execute(msg, args) {
        // get command
        const userCommand = args.shift();
        const command = msg.client.musicCommands.find(cmd => cmd.names.includes(userCommand));

        //--------------------------------------------------------------------------------

        if (typeof command === 'undefined') {
            return;
        }

        if (command.vcMemberOnly && !vcCheck(msg)) {
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.channel.send(`Please provide arguments\nex: \`${prefix}${music.names[0]} ${command.names[0]} ${command.usage}\``);
            return;
        }

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