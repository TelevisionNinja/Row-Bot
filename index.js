const Discord = require('discord.js');
const fileSys = require('fs');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.login(token);

const cooldowns = new Discord.Collection();

client.on('ready', () => {
    console.log('Row Bot is up');
});

const commandFiles = fileSys.readdirSync('./commands/').filter(aFile => aFile.endsWith('.js'));

client.commands = new Discord.Collection();

for (const aFile of commandFiles) {
    const command = require(`./commands/${aFile}`);
    client.commands.set(command.name, command);
}

client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) {
        return;
    }

    //--------------------------------------------------------------------------------

    const args = msg.content.slice(prefix.length).trim().split(' ');
    const userCommand = args.shift().toLowerCase();

    //--------------------------------------------------------------------------------

    if (!client.commands.has(userCommand)) {
        return;
    }

    const command = client.commands.get(userCommand);

    if (command.args && !args.length) {
        msg.channel.send(`Provide arguments\nex: ${prefix}${command.name} ${command.usage}`);
        return;
    }

    //--------------------------------------------------------------------------------
    // cooldown

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;
    const now = Date.now();
    
    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            msg.channel.send(`Please let the command cooldown in ${timeLeft.toFixed(1)} second(s)`);
            return;
        }
    }

    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

    //--------------------------------------------------------------------------------

    try {
        command.execute(msg, args);
    }
    catch (error) {
        msg.channel.send('I couldn\'t do that command for some reason');
    }
});