import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { default as config } from './config.json';
import {
    hasBotMention,
    sendTypingMsg,
    hasMentions
} from './lib/msgUtils.js';
import {
    removeProhibitedChars,
    includesPhrase,
    removeMentions
} from './lib/stringUtils.js';
import { default as sendEasyMsg } from './commands/tulpCommands/easyMessages/sendEasyMsg.js';

//--------------------------------------------------------------------------------

const prefix = config.prefix,
    token = config.token,
    activityStatus = config.activityStatus,
    names = config.names.map(n => n.toLowerCase());

const client = new Client();
const cooldowns = new Map();
client.commands = [];
client.tulpCommands = [];
let noncommands = [];
let genMsg = [];
let intervalMsgs = [];
const minimumPermissions = ['MANAGE_WEBHOOKS', 'MANAGE_MESSAGES', 'SEND_MESSAGES'];

//--------------------------------------------------------------------------------
// load commands, tulp commands, noncommands, general messages, and interval messages

const commandFiles = readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const tulpCommandFiles = readdirSync('./commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgFiles = readdirSync('./intervalMessages/').filter(aFile => aFile.endsWith('.js'));

for (let i = 0, n = commandFiles.length; i < n; i++) {
    client.commands[i] = (await import(`./commands/${commandFiles[i]}`)).default;
}

for (let i = 0, n = tulpCommandFiles.length; i < n; i++) {
    client.tulpCommands[i] = (await import(`./commands/tulpCommands/${tulpCommandFiles[i]}`)).default;
}

for (let i = 0, n = noncommandFiles.length; i < n; i++) {
    noncommands[i] = (await import(`./noncommands/${noncommandFiles[i]}`)).default;
}

for (let i = 0, n = genMsgFiles.length; i < n; i++) {
    genMsg[i] = (await import(`./generalMessages/${genMsgFiles[i]}`)).default;
}

for (let i = 0, n = intervalMsgFiles.length; i < n; i++) {
    intervalMsgs[i] = (await import(`./intervalMessages/${intervalMsgFiles[i]}`)).default;
}

//--------------------------------------------------------------------------------
// login actions

client.on('ready', () => {
    // start interval messages
    for (let i = 0, n = intervalMsgs.length; i < n; i++) {
        intervalMsgs[i].execute(client);
    }

    //--------------------------------------------------------------------------------
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Row Bot is up: ${client.readyAt.toString()}`);
});

//--------------------------------------------------------------------------------
// message actions

client.on('message', async msg => {
    const notBot = !msg.author.bot;
    const hasLength = msg.content.length;
    const msgFilterBool = notBot && hasLength;

    if (!msgFilterBool) {
        return;
    }

    if (msg.channel.type !== 'dm') {
        const guildMemberClient = msg.guild.me;
        const isAdmin = guildMemberClient.hasPermission('ADMINISTRATOR');
        const hasMinimumPerms = guildMemberClient.hasPermission(minimumPermissions);
        const meetsConditions = msgFilterBool && (isAdmin || hasMinimumPerms);

        if (!meetsConditions) {
            return;
        }
    }

    //--------------------------------------------------------------------------------

    const msgStr = msg.content.toLowerCase();

    if (msgStr.startsWith(prefix)) {
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
            args = removeProhibitedChars(args.join(' ')).split(' ');
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

        return;
    }

    // send tulp messages easily
    if (await sendEasyMsg.sendEasyMsg(msg)) {
        return;
    }

    //--------------------------------------------------------------------------------
    // set up vars for noncommands and general messages

    let botMention = hasBotMention(msg);
    let selectedName = '';

    //--------------------------------------------------------------------------------
    // detect any mentions

    if (!botMention) {
        for (let i = 0, n = names.length; i < n; i++) {
            const currentName = names[i];

            if (currentName.length > selectedName.length &&
                includesPhrase(msgStr, currentName, false)) {
                botMention = true;
                selectedName = currentName;
            }
        }
    }

    if (botMention) {
        //--------------------------------------------------------------------------------
        // noncommands

        // remove mentions or name from message
        const noMentionsMsg = removeMentions(msgStr, selectedName);

        for (let i = 0, n = noncommands.length; i < n; i++) {
            const replyStr = noncommands[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msgStr);
                return;
            }
        }
    }
    else if (!hasMentions(msg, false)) {
        //--------------------------------------------------------------------------------
        // general message

        // remove mentions or name from message
        const noMentionsMsg = removeMentions(msgStr, selectedName);

        for (let i = 0, n = genMsg.length; i < n; i++) {
            const replyStr = genMsg[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msgStr);
                return;
            }
        }
    }
});

//--------------------------------------------------------------------------------
// disconnect

client.on('disconnect', () => console.log(`Row Bot disconnected ${new Date().toString()}`));

//--------------------------------------------------------------------------------
// login

client.login(token);
