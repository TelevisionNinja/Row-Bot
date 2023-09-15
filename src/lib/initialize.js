import {
    GatewayIntentBits,
    Partials,
    ActivityType
} from 'discord.js';
import { readdir } from 'fs/promises';
import config from '../../config/config.json' assert { type: 'json' };
import { initialize as initializeHelp } from '../commands/help.js';
import { initialize as initializeTulpHelp } from '../commands/tulpCommands/help.js';
import { initialize as initializeMusicHelp } from '../commands/musicCommands/help.js';
import messages from '../../config/messages.json' assert { type: 'json' };
import reactionRoles from '../../config/reactionRoles.json' assert { type: 'json' };
import {
    buildCommandJSON,
    loadGlobalSlashCommands
} from './slashCommandUtils.js';
import { pathToFileURL } from 'url';
import path from 'path';

export {
    prefix,
    token,
    clientID,
    activityStatus,
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
    greetings,
    reactionRoles
};

//--------------------------------------------------------------------------------
// config vars

const prefix = config.prefix,
    token = config.token,
    clientID = config.clientID,
    activityStatus = `${config.activityStatus} | ${prefix}help or /help`,
    minimumPermissions = config.minimumPermissions,
    devGuildID = config.devGuildID,
    ruleChannelID = config.ruleChannelID,
    greetings = messages.greetings;

//--------------------------------------------------------------------------------
// client vars

const clientOptions = {
    intents: [
        // dm's
        GatewayIntentBits.DirectMessages,

        // guilds
        GatewayIntentBits.Guilds, // webhook management
        GatewayIntentBits.GuildMessages, // messages and proxy
        GatewayIntentBits.GuildVoiceStates, // music commands
        GatewayIntentBits.GuildMessageReactions, // reaction roles

        // priviledged
        GatewayIntentBits.GuildMembers, // late night bois, guild welcome message
        GatewayIntentBits.MessageContent // messages
    ],

    partials: [
        Partials.Channel, // dm channels
        Partials.Message, // reaction roles
        Partials.Reaction // reaction roles
    ],

    presence: {
        activities: [
            {
                name: activityStatus,
                type: ActivityType.Custom,
                state: activityStatus
            }
        ]
    },

    rest: { retries: Infinity }
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

// read files
let commandsDirectory = path.resolve('./src/commands/');
let tulpCommandsDirectory = path.resolve('./src/commands/tulpCommands/');
let musicCommandsDirectory = path.resolve('./src/commands/musicCommands/');
let noncommandsDirectory = path.resolve('./src/noncommands/');
let genMsgDirectory = path.resolve('./src/generalMessages/');
let intervalMsgsDirectory = path.resolve('./src/intervalMessages/');
let audioFilesDirectory = path.resolve('./audioFiles/');

const files = await Promise.all([
    readdir(commandsDirectory, {
        recursive: false
    }),
    readdir(tulpCommandsDirectory, {
        recursive: false
    }),
    readdir(musicCommandsDirectory, {
        recursive: false
    }),
    readdir(noncommandsDirectory, {
        recursive: false
    }),
    readdir(genMsgDirectory, {
        recursive: false
    }),
    readdir(intervalMsgsDirectory, {
        recursive: false
    }),
    readdir(audioFilesDirectory, {
        recursive: false
    })
]);

commands = files[0].filter(aFile => aFile.endsWith('.js'));
tulpCommands = files[1].filter(aFile => aFile.endsWith('.js'));
musicCommands = files[2].filter(aFile => aFile.endsWith('.js'));
noncommands = files[3].filter(aFile => aFile.endsWith('.js'));
genMsg = files[4].filter(aFile => aFile.endsWith('.js'));
intervalMsgs = files[5].filter(aFile => aFile.endsWith('.js'));
audio = files[6];

// imports

commandsDirectory = pathToFileURL(commandsDirectory).toString();
tulpCommandsDirectory = pathToFileURL(tulpCommandsDirectory).toString();
musicCommandsDirectory = pathToFileURL(musicCommandsDirectory).toString();
noncommandsDirectory = pathToFileURL(noncommandsDirectory).toString();
genMsgDirectory = pathToFileURL(genMsgDirectory).toString();
intervalMsgsDirectory = pathToFileURL(intervalMsgsDirectory).toString();

commands = commands.map(f => import(path.join(commandsDirectory, f)));
tulpCommands = tulpCommands.map(f => import(path.join(tulpCommandsDirectory, f)));
musicCommands = musicCommands.map(f => import(path.join(musicCommandsDirectory, f)));
noncommands = noncommands.map(f => import(path.join(noncommandsDirectory, f)));
genMsg = genMsg.map(f => import(path.join(genMsgDirectory, f)));
intervalMsgs = intervalMsgs.map(f => import(path.join(intervalMsgsDirectory, f)));
audio = audio.map(f => path.join(audioFilesDirectory, f));

const loadedModules = await Promise.all([
    Promise.all(commands),
    Promise.all(tulpCommands),
    Promise.all(musicCommands),
    Promise.all(noncommands),
    Promise.all(genMsg),
    Promise.all(intervalMsgs)
]);

// map names

commands = loadedModules[0].map(i => i.default);
tulpCommands = loadedModules[1].map(i => i.default);
musicCommands = loadedModules[2].map(i => i.default);
noncommands = loadedModules[3];
genMsg = loadedModules[4];
intervalMsgs = loadedModules[5];

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
// initialize interval messages

let once = false;

export function initializeIntervals(client) {
    if (once || !client.guilds.cache.has(devGuildID)) {
        return;
    }

    once = true;

    for (let i = 0, n = intervalMsgs.length; i < n; i++) {
        intervalMsgs[i].execute(client);
    }
}

//--------------------------------------------------------------------------------
// slash commands

export async function loadSlashCommands() {
    let slashCommands = buildCommandJSON(commands);
    let breakBool = false;

    for (let i = 0, n = slashCommands.length; i < n; i++) {
        let slashCommand = slashCommands[i];

        if (slashCommand.name === 'tulp') {
            slashCommand.options = buildCommandJSON(tulpCommands);
            // slashCommands[i] = slashCommand;

            if (breakBool) {
                break;
            }

            breakBool = true;
        }
        else if (slashCommand.name === 'music') {
            slashCommand.options = buildCommandJSON(musicCommands);
            // slashCommands[i] = slashCommand;

            if (breakBool) {
                break;
            }

            breakBool = true;
        }
    }

    console.log('Started refreshing application (/) commands.');

    const response = await loadGlobalSlashCommands(slashCommands, clientID, token);

    if (response.ok) {
        console.log('Successfully reloaded application (/) commands.');
    }
    else {
        console.log(response);
    }
}
