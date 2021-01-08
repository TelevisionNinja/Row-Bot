const Discord = require('discord.js');
const fileSys = require('fs');
const {
    prefix,
    token,
    activityStatus,
    aliases,
} = require('./config.json');
const msgUtils = require('./lib/msgUtils.js');
const stringUtils = require('./lib/stringUtils.js');

const client = new Discord.Client();

//--------------------------------------------------------------------------------
// load commands, noncommands, and general messages

const commandFiles = fileSys.readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = fileSys.readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = fileSys.readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgs = fileSys.readdirSync('./intervalMessages/').filter(aFile => aFile.endsWith('.js'));

const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.noncommands = [];
client.genMsg = [];

for (let i = 0, n = commandFiles.length; i < n; i++) {
    const command = require(`./commands/${commandFiles[i]}`);
    client.commands.set(command.names[0], command);
}

for (let i = 0, n = noncommandFiles.length; i < n; i++) {
    client.noncommands[i] = require(`./noncommands/${noncommandFiles[i]}`);
}

for (let i = 0, n = genMsgFiles.length; i < n; i++) {
    client.genMsg[i] = require(`./generalMessages/${genMsgFiles[i]}`);
}

//--------------------------------------------------------------------------------
// login bot

client.login(token);

client.on('ready', () => {
    const time = new Date();
    console.log(`Row Bot is up at ${time.getHours()}:${time.getMinutes()}`);
    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    for (let i = 0, n = intervalMsgs.length; i < n; i++) {
        require(`./intervalMessages/${intervalMsgs[i]}`).execute(client);
    }
});

//--------------------------------------------------------------------------------

client.on('message', msg => {
    if (msg.author.bot) {
        return;
    }

    const msgStr = msg.content.toLowerCase();

    if (!msgStr.startsWith(prefix)) {
        let botReply = '';
        let replyBool = false;

        //--------------------------------------------------------------------------------
        // noncommands

        let nonCommandBool = false;

        for (let i = 0, n = aliases.length; i < n; i++) {
            if (msgStr.includes(aliases[i].toLowerCase())) {
                nonCommandBool = true;

                for (let j = 0, m = client.noncommands.length; j < m; j++) {
                    const {
                        isNoncommand,
                        replyStr
                    } = client.noncommands[j].execute(msgStr);

                    if (isNoncommand) {
                        replyBool = true;
                        botReply = replyStr;
                        break;
                    }
                }

                nonCommandBool = false;
                break;
            }
        }

        //--------------------------------------------------------------------------------
        // general message

        if (!nonCommandBool) {
            for (let i = 0, n = client.genMsg.length; i < n; i++) {
                const {
                    hasReply,
                    replyStr
                } = client.genMsg[i].execute(msgStr);
    
                if (hasReply) {
                    replyBool = true;
                    botReply = replyStr;
                    break;
                }
            }
        }

        //--------------------------------------------------------------------------------
        // reply

        if (replyBool) {
            msgUtils.sendTypingMsg(msg.channel, botReply, msgStr);
        }

        return;
    }

    //--------------------------------------------------------------------------------
    // split command and arguments

    let args = msgStr.slice(prefix.length).trim().split(' ');
    const userCommand = args.shift();

    //--------------------------------------------------------------------------------
    // get command

    const command = client.commands.find(cmd => cmd.names.includes(userCommand));

    if (!command) {
        return;
    }

    if (command.guildOnly && msg.channel.type === 'dm') {
        msg.channel.send('I can\'t execute that command in DM\'s');
        return;
    }

    if (command.permittedCharsOnly) {
        let argStr = args.join(' ');
        argStr = stringUtils.removeProhibitedChars(argStr);

        if (argStr.length) {
            args = argStr.split(' ');
        }
        else {
            args = [];
        }
    }

    if (command.args && !args.length) {
        msg.channel.send(`Please provide arguments\nex: \`${prefix}${command.names[0]} ${command.usage}\``);
        return;
    }

    //--------------------------------------------------------------------------------
    // cooldown

    if (!cooldowns.has(command.names[0])) {
        cooldowns.set(command.names[0], new Discord.Collection());
    }
    
    const timestamps = cooldowns.get(command.names[0]);
    const cooldownAmount = command.cooldown * 1000;
    const now = Date.now();
    
    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            msg.channel.send(`Please let me cooldown for ${timeLeft.toFixed(1)} second(s)`);
            return;
        }
    }

    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

    //--------------------------------------------------------------------------------
    // execute command

    try {
        command.execute(msg, args);
    }
    catch (error) {
        msg.channel.send('I couldn\'t do that command for some reason 😢');
        console.log(error);
    }
});
