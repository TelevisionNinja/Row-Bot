import { Intents } from 'discord.js';
import { readdirSync } from 'fs';
import { default as config } from './config.json';
import { initialize as initializeHelp } from './commands/help.js';
import { initialize as initializeTulpHelp } from './commands/tulpCommands/help.js';
import { initialize as initializeMusicHelp } from './commands/musicCommands/help.js';
import { default as messages } from './messages.json';
// import {
//     buildCommandJSON,
//     loadGlobalSlashCommands
// } from './lib/slashCommandUtils.js';

export {
    prefix,
    token,
    clientID,
    activityStatus,
    names,
    minimumPermissions,
    devGuildID,
    ruleChannelID,
    clientOptions,

    speechArr,
    audio,

    commandMap,
    tulpCommandMap,
    musicCommandMap,

    noncommands,
    genMsg,
    intervalMsgs,
    greetings
};

//--------------------------------------------------------------------------------
// config vars

const prefix = config.prefix,
    token = config.token,
    clientID = config.clientID,
    activityStatus = config.activityStatus,
    names = config.names.map(n => n.toLowerCase()),
    minimumPermissions = config.minimumPermissions,
    devGuildID = config.devGuildID,
    ruleChannelID = config.ruleChannelID,
    greetings = messages.greetings;

//--------------------------------------------------------------------------------
// client vars

const clientOptions = {
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
};
let commandMap = new Map();
let tulpCommandMap = new Map();
let musicCommandMap = new Map();
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
        commandMap.set(command.names[j], command);
    }
}

for (let i = 0, n = tulpCommands.length; i < n; i++) {
    const tulpCommand = tulpCommands[i];

    for (let j = 0, m = tulpCommand.names.length; j < m; j++) {
        tulpCommandMap.set(tulpCommand.names[j], tulpCommand);
    }
}

for (let i = 0, n = musicCommands.length; i < n; i++) {
    const musicCommand = musicCommands[i];

    for (let j = 0, m = musicCommand.names.length; j < m; j++) {
        musicCommandMap.set(musicCommand.names[j], musicCommand);
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
