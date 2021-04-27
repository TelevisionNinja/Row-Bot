import { default as config } from '../config.json';

const tulp = config.tulp,
    prefix = config.prefix;

export default {
    names: tulp.names,
    description: tulp.description,
    argsRequired: true,
    argsOptional: false,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<command>',
    cooldown: 0,
    execute(msg, args) {
        // get command
        const userCommand = args.shift();
        const command = msg.channel.client.tulpCommands.find(cmd => cmd.names.includes(userCommand));

        //--------------------------------------------------------------------------------

        if (!command) {
            return;
        }

        if (command.guildOnly && msg.channel.type === 'dm') {
            msg.channel.createMessage('I can\'t execute that command in DM\'s');
            return;
        }

        if (command.argsRequired && !args.length) {
            msg.channel.createMessage(`Please provide arguments\nex: \`${prefix}${tulp.names[0]} ${command.names[0]} ${command.usage}\``);
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
            msg.channel.createMessage('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }
    }
}