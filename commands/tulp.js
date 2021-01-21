const {
    tulp,
    prefix
} = require('../config.json');
const fileSys = require('fs');

//--------------------------------------------------------------------------------
// load commands

const commandFiles = fileSys.readdirSync('./commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));

let commands = [];

for (let i = 0, n = commandFiles.length; i < n; i++) {
    commands[i] = require(`./tulpCommands/${commandFiles[i]}`);
}

//--------------------------------------------------------------------------------

module.exports = {
    names: tulp.names,
    description: tulp.description,
    args: true,
    permittedCharsOnly: false,
    guildOnly: false,
    usage: '<command>',
    cooldown: 0,
    async execute(msg, args) {
        commandHandler(msg, args);
    }
}

//--------------------------------------------------------------------------------

function commandHandler(msg, args) {
    // get command
    const userCommand = args.shift();
    const command = commands.find(cmd => cmd.names.includes(userCommand));

    //--------------------------------------------------------------------------------

    if (!command) {
        return;
    }

    if (command.guildOnly && msg.channel.type === 'dm') {
        msg.channel.send('I can\'t execute that command in DM\'s');
        return;
    }

    if (command.args && !args.length) {
        msg.channel.send(`Please provide arguments\nex: \`${prefix}${tulp.names[0]} ${command.names[0]} ${command.usage}\``);
        return;
    }

    //--------------------------------------------------------------------------------

    const tulpArgs = msg.content.slice(prefix.length).trim().split(' ');
    tulpArgs.shift();
    tulpArgs.shift();

    //--------------------------------------------------------------------------------
    // make commands available for the help command

    msg.tulpCommands = commands;

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
