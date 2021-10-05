import {
    Client,
    Intents
} from 'discord.js';
import { readdirSync } from 'fs';
import { default as config } from './config.json';
import {
    hasBotMention,
    sendTypingMsg,
    hasMentions
} from './lib/msgUtils.js';
import {
    removeAllSpecialChars,
    includesPhrase,
    removeMentions
} from './lib/stringUtils.js';
import { default as sendEasyMsg } from './commands/tulpCommands/easyMessages/sendEasyMsg.js';
import { default as tulpCache } from './lib/tulpCache.js';
import { randomMath } from './lib/randomFunctions.js';
import { getChatBotReply } from './lib/chatBot.js';
import { initialize as initializeHelp } from './commands/help.js';
import { initialize as initializeTulpHelp } from './commands/tulpCommands/help.js';
import { initialize as initializeMusicHelp } from './commands/musicCommands/help.js';
import { default as audioPlayer } from './lib/audio.js';
import { default as messages } from './messages.json';
import { extractAndConvertAmpLinks } from './lib/urlUtils.js';
import { Readable } from 'stream';
import {
    getTtsUrl,
    getTtsBuffer
} from './commands/tts.js';
// import {
//     buildCommandJSON,
//     loadGlobalSlashCommands
// } from './lib/slashCommandUtils.js';

//--------------------------------------------------------------------------------
// config vars

const prefix = config.prefix,
    token = config.token,
    clientID = config.clientID,
    activityStatus = config.activityStatus,
    names = config.names.map(n => n.toLowerCase()),
    minimumPermissions = config.minimumPermissions,
    devGuildID = config.devGuildID,
    ruleChannelID = config.ruleChannelID;

//--------------------------------------------------------------------------------
// client vars

const client = new Client({
    retryLimit: Infinity,

    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,

        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_WEBHOOKS
    ],

    partials: ['CHANNEL']
});
const cooldowns = new Map();
client.commands = new Map();
client.tulpCommands = new Map();
client.musicCommands = new Map();
let commands = [];
let tulpCommands = [];
let musicCommands = [];
let noncommands = [];
let genMsg = [];
let intervalMsgs = [];
const speechArr = [...messages.greetings.filter(g => g.length >= 5), ...messages.speech];
let audio = [];

//--------------------------------------------------------------------------------
// load commands, tulp commands, noncommands, general messages, and interval messages

const commandFiles = readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));
const tulpCommandFiles = readdirSync('./commands/tulpCommands/').filter(aFile => aFile.endsWith('.js'));
const musicCommandFiles = readdirSync('./commands/musicCommands/').filter(aFile => aFile.endsWith('.js'));
const noncommandFiles = readdirSync('./noncommands/').filter(aFile => aFile.endsWith('.js'));
const genMsgFiles = readdirSync('./generalMessages/').filter(aFile => aFile.endsWith('.js'));
const intervalMsgFiles = readdirSync('./intervalMessages/').filter(aFile => aFile.endsWith('.js'));
const audioFiles = readdirSync('./audioFiles/');

commands = commandFiles.map(f => import(`./commands/${f}`));
tulpCommands = tulpCommandFiles.map(f => import(`./commands/tulpCommands/${f}`));
musicCommands = musicCommandFiles.map(f => import(`./commands/musicCommands/${f}`));
noncommands = noncommandFiles.map(f => import(`./noncommands/${f}`));
genMsg = genMsgFiles.map(f => import(`./generalMessages/${f}`));
intervalMsgs = intervalMsgFiles.map(f => import(`./intervalMessages/${f}`));
audio = audioFiles.map(f => `./audioFiles/${f}`);

commands = (await Promise.all(commands)).map(i => i.default);
tulpCommands = (await Promise.all(tulpCommands)).map(i => i.default);
musicCommands = (await Promise.all(musicCommands)).map(i => i.default);
noncommands = await Promise.all(noncommands);
genMsg = await Promise.all(genMsg);
intervalMsgs = await Promise.all(intervalMsgs);

for (let i = 0, n = commands.length; i < n; i++) {
    const command = commands[i];

    for (let j = 0, m = command.names.length; j < m; j++) {
        client.commands.set(command.names[j], command);
    }
}

for (let i = 0, n = tulpCommands.length; i < n; i++) {
    const tulpCommand = tulpCommands[i];

    for (let j = 0, m = tulpCommand.names.length; j < m; j++) {
        client.tulpCommands.set(tulpCommand.names[j], tulpCommand);
    }
}

for (let i = 0, n = musicCommands.length; i < n; i++) {
    const musicCommand = musicCommands[i];

    for (let j = 0, m = musicCommand.names.length; j < m; j++) {
        client.musicCommands.set(musicCommand.names[j], musicCommand);
    }
}

//--------------------------------------------------------------------------------
// initialize help embeds

initializeHelp(commands);
initializeTulpHelp(tulpCommands);
initializeMusicHelp(musicCommands);

//--------------------------------------------------------------------------------
// slash commands

// let slashCommands = buildCommandJSON(commands);

// for (let i = 0, n = slashCommands.length; i < n; i++) {
//     let slashCommand = slashCommands[i];

//     if (slashCommand.name === 'tulp') {
//         slashCommand.options = buildCommandJSON(tulpCommands);
//         slashCommands[i] = slashCommand;
//         break;
//     }
// }

// for (let i = 0, n = slashCommands.length; i < n; i++) {
//     let slashCommand = slashCommands[i];

//     if (slashCommand.name === 'music') {
//         slashCommand.options = buildCommandJSON(musicCommands);
//         slashCommands[i] = slashCommand;
//         break;
//     }
// }

// loadGlobalSlashCommands(slashCommands, clientID, token);

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

    console.log(`Startup: ${client.readyAt.toString()}`);
});

//--------------------------------------------------------------------------------
// message actions

client.on('messageCreate', async msg => {
    // filter messages
    if (msg.author.bot || !msg.content.length) {
        return;
    }

    const isDM = msg.channel.type === 'DM';

    // permissions
    if (!isDM) {
        const permissions = msg.channel.permissionsFor(clientID);

        // must be admin or have minimum permissions
        if (!permissions.has(minimumPermissions)) {
            return;
        }
    }

    //--------------------------------------------------------------------------------
    // commands and messages

    if (msg.content.startsWith(prefix)) {
        // split command and arguments

        // discord trims the original message so only a left trim is needed
        let args = msg.content.slice(prefix.length).trimStart().split(' ');
        const userCommand = args.shift().toLowerCase();

        //--------------------------------------------------------------------------------
        // get command

        const command = client.commands.get(userCommand);

        if (typeof command === 'undefined') {
            return;
        }

        if (command.guildOnly && isDM) {
            msg.channel.send('I can\'t execute that command in DM\'s');
            return;
        }

        if (command.noSpecialChars) {
            const argStr = removeAllSpecialChars(args.join(' '));

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
            await command.execute(msg, args);
        }
        catch (error) {
            msg.channel.send('I couldn\'t do that command for some reason 😢');
            console.log(error);
        }

        return;
    }

    //--------------------------------------------------------------------------------
    // send tulp messages easily

    const userData = tulpCache.get(msg.author.id);

    if (userData !== null && await sendEasyMsg.sendEasyMsg(msg, userData)) {
        return;
    }

    //--------------------------------------------------------------------------------
    // chat bot

    if (hasBotMention(msg, false, true, false)) {
        const noMentionsMsg = removeMentions(msg.content);
        const replyStr = await getChatBotReply(msg.author.id, noMentionsMsg);

        // reply
        if (replyStr.length) {
            sendTypingMsg(msg.channel, replyStr, msg.content);
            return;
        }
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

            if (currentName.length > selectedName.length && includesPhrase(msg.content, currentName, false)) {
                botMention = true;
                selectedName = currentName;
            }
        }
    }

    if (botMention) {
        // remove mentions or name from message
        const noMentionsMsg = removeAllSpecialChars(removeMentions(msg.content, selectedName)).trim().toLowerCase();

        //--------------------------------------------------------------------------------
        // voice

        if (!isDM && msg.member.voice.channel) {
            if (noMentionsMsg === 'join me') {
                audioPlayer.joinVC(msg);
                return;
            }
            else if (noMentionsMsg === 'leave') {
                audioPlayer.leave(msg.guild.id);
                return;
            }
            else if ((noMentionsMsg === 'speak' || noMentionsMsg === 'talk') && audioPlayer.vcCheck(msg)) {
                const url = await getTtsUrl('Pinkie Pie', speechArr[randomMath(speechArr.length)]);

                // play backup audio
                if (!url.length) {
                    audioPlayer.playFile(msg, audio[randomMath(audio.length)]);
                    return;
                }

                const buffer = await getTtsBuffer(url);

                if (typeof buffer === 'undefined') {
                    return;
                }

                audioPlayer.playStream(msg, Readable.from(buffer));
                return;
            }
        }

        //--------------------------------------------------------------------------------
        // noncommands

        for (let i = 0, n = noncommands.length; i < n; i++) {
            const replyStr = noncommands[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msg.content);
                return;
            }
        }
    }
    else if (!hasMentions(msg, false)) {
        //--------------------------------------------------------------------------------
        // general message

        // remove mentions from message
        const noMentionsMsg = removeAllSpecialChars(removeMentions(msg.content)).trim().toLowerCase();

        for (let i = 0, n = genMsg.length; i < n; i++) {
            const replyStr = genMsg[i].execute(msg, noMentionsMsg);

            // reply
            if (replyStr.length) {
                sendTypingMsg(msg.channel, replyStr, msg.content);
                return;
            }
        }
    }

    //--------------------------------------------------------------------------------
    // AMP links

    if (!isDM && msg.guild.id !== devGuildID) {
        return;
    }

    const links = await extractAndConvertAmpLinks(msg.content);

    if (links.length) {
        msg.reply({
            content: `It looks like you sent an AMP link. You should check out the canonical link instead for privacy reasons:\n${links.join('\n')}`,
            allowedMentions: {
                repliedUser: false
            }
        });
    }
});

//--------------------------------------------------------------------------------
// interaction actions

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        return;
    }

    //--------------------------------------------------------------------------------
    // get command

    const command = client.commands.get(interaction.commandName);

    if (command.guildOnly && !interaction.inGuild()) {
        interaction.reply('I can\'t execute that command in DM\'s');
        return;
    }

    //--------------------------------------------------------------------------------
    // execute command

    try {
        await command.executeInteraction(interaction);
    }
    catch (error) {
        const content = {
            content: 'I couldn\'t do that command for some reason 😢',
            ephemeral: true
        };

        if (interaction.deferred) {
            interaction.editReply(content);
        }
        else {
            interaction.reply(content);
        }

        console.log(error);
    }
});

//--------------------------------------------------------------------------------
// disconnect

client.on('shardDisconnect', () => console.log(`Disconnected: ${new Date().toString()}`));

//--------------------------------------------------------------------------------
// reconnect

client.on('shardResume', () => {
    // set activity

    client.user.setActivity(activityStatus, { type: 'PLAYING' });

    //--------------------------------------------------------------------------------
    // console log the start up time

    console.log(`Reconnected: ${new Date().toString()}`);
});

//--------------------------------------------------------------------------------
// delete webhook data

client.on('channelDelete', channel => {
    tulpCache.deleteWebhook(channel.id);
});

client.on('threadDelete', thread => {
    tulpCache.deleteWebhook(thread.id);
});

//--------------------------------------------------------------------------------
// tulp cache

// cache user data and the channel webhook while the user is typing
client.on('typingStart', async typing => {
    tulpCache.loadCache(typing.user.id, typing.channel.id);
});

//--------------------------------------------------------------------------------
// welcome message

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== devGuildID) {
        return;
    }

    const channel = member.guild.systemChannel;

    if (channel === null || !channel.permissionsFor(clientID).has('SEND_MESSAGES')) {
        return;
    }

    const greetingMsg = messages.greetings[randomMath(messages.greetings.length)];
    const msg = `Please check the <#${ruleChannelID}> channel for some info 🙂`;

    sendTypingMsg(channel, `${greetingMsg} <@${member.id}> ${msg}`, member.user.username);
});

//--------------------------------------------------------------------------------
// login

client.login(token);
