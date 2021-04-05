const Discord = require('discord.js');
const fileSys = require('fs');
const {
    prefix,
    token,
    activityStatus,
    names
} = require('./config.json');
const msgUtils = require('./lib/msgUtils.js');
const stringUtils = require('./lib/stringUtils.js');
const { sendEasyMsg } = require('./commands/tulpCommands/easyMessages/sendEasyMsg.js');

const client = new Discord.Client();

//--------------------------------------------------------------------------------
// load commands, noncommands, and general messages

const commandFiles = fileSys.readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = fileSys.readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = fileSys.readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgs = fileSys.readdirSync('./intervalMessages/').filter(aFile => aFile.endsWith('.js'));
const tulpCommandFiles = fileSys.readdirSync('./commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));

const cooldowns = new Map();
client.commands = [];
client.noncommands = [];
client.genMsg = [];
client.tulpCommands = [];

for (let i = 0, n = commandFiles.length; i < n; i++) {
    client.commands[i] = require(`./commands/${commandFiles[i]}`);
}

for (let i = 0, n = noncommandFiles.length; i < n; i++) {
    client.noncommands[i] = require(`./noncommands/${noncommandFiles[i]}`);
}

for (let i = 0, n = genMsgFiles.length; i < n; i++) {
    client.genMsg[i] = require(`./generalMessages/${genMsgFiles[i]}`);
}

for (let i = 0, n = tulpCommandFiles.length; i < n; i++) {
    client.tulpCommands[i] = require(`./commands/tulpCommands/${tulpCommandFiles[i]}`);
}

//--------------------------------------------------------------------------------
// login actions

client.on('ready', () => {
    // start interval messages
    for (let i = 0, n = intervalMsgs.length; i < n; i++) {
        require(`./intervalMessages/${intervalMsgs[i]}`).execute(client);
    }

    //--------------------------------------------------------------------------------
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    const time = new Date();

    let milliSeconds = time.getMilliseconds().toString();
    if (milliSeconds.length === 2) {
        milliSeconds = `0${milliSeconds}`;
    }
    else if (milliSeconds.length === 1) {
        milliSeconds = `00${milliSeconds}`;
    }

    let seconds = time.getSeconds().toString();
    if (seconds.length === 1) {
        seconds = `0${seconds}`;
    }

    let minutes = time.getMinutes().toString();
    if (minutes.length === 1) {
        minutes = `0${minutes}`;
    }

    let hours = time.getHours().toString();
    if (hours.length === 1) {
        hours = `0${hours}`;
    }

    console.log(`Row Bot is up ${time.getMonth() + 1}/${time.getDate()}/${time.getFullYear()} ${hours}:${minutes}:${seconds}.${milliSeconds}`);
});

//--------------------------------------------------------------------------------
// message actions

client.on('message', async msg => {
    if (msg.author.bot) {
        return;
    }

    let msgStr = msg.content.toLowerCase();

    if (!(msgStr.startsWith(prefix))) {
        // send tulp messages easily
        if (await sendEasyMsg(msg)) {
            return;
        }

        //--------------------------------------------------------------------------------

        let botReply = '';
        let replyBool = false;

        //msgStr = stringUtils.removeAllSpecialChars(msgStr);
        const words = msgStr.split(' ');

        //--------------------------------------------------------------------------------
        // noncommands

        let hasName = false;

        for (let i = 0, n = names.length; i < n; i++) {
            if (msgStr.includes(names[i].toLowerCase())) {
                hasName = true;
                break;
            }
        }

        if (hasName || msgUtils.hasBotMention(msg, false, true, false)) {
            for (let i = 0, n = client.noncommands.length; i < n; i++) {
                const {
                    isNoncommand,
                    replyStr
                } = client.noncommands[i].execute(msgStr, words);

                if (isNoncommand) {
                    replyBool = true;
                    botReply = replyStr;
                    break;
                }
            }
        }

        //--------------------------------------------------------------------------------
        // general message

        if (!replyBool && (!(msgUtils.hasMentions(msg)) || msgUtils.hasBotMention(msg))) {
            for (let i = 0, n = client.genMsg.length; i < n; i++) {
                const {
                    hasReply,
                    replyStr
                } = client.genMsg[i].execute(msgStr, words);

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
        let argStr = stringUtils.removeProhibitedChars(args.join(' '));

        if (argStr.length) {
            args = argStr.split(' ');
        }
        else {
            args = [];
        }
    }

    if (command.argsRequired && !args.length) {
        msg.channel.send(`Please provide arguments\nex: \`${prefix}${command.names[0]} ${command.usage}\``);
        return;
    }

    //--------------------------------------------------------------------------------
    // cooldown

    if (!cooldowns.has(command.names[0])) {
        cooldowns.set(command.names[0], new Map());
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

//--------------------------------------------------------------------------------
// login

client.login(token);
