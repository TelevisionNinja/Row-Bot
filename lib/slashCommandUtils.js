import axios from 'axios';

const apiVersion = 9;
const apiURL = `https://discord.com/api/v${apiVersion}`;

/**
 * builds a slash command json array
 * 
 * @param {*} commandArr 
 * @returns 
 */
export function buildCommandJSON(commandArr) {
    let slashCommandJSONs = [];

    for (let i = 0, n = commandArr.length; i < n; i++) {
        const command = commandArr[i].interactionData;

        // only include commands with slash variant
        if (command) {
            slashCommandJSONs.push(command);
        }
    }

    return slashCommandJSONs;
}

/**
 * register global slash commands
 * 
 * @param {*} slashCommands 
 * @param {*} clientID 
 * @param {*} token 
 */
export async function loadGlobalSlashCommands(slashCommands, clientID, token) {
    try {
        console.log('Started refreshing application (/) commands.');

        await axios.put(`${apiURL}/applications/${clientID}/commands`,
        slashCommands,
        {
            headers: {
                Authorization: `Bot ${token}`
            }
        });

        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.log(error);
    }
}

/**
 * register guild slash commands
 * 
 * @param {*} slashCommands 
 * @param {*} clientID 
 * @param {*} token 
 * @param {*} guildID 
 */
export async function loadGuildSlashCommands(slashCommands, clientID, token, guildID) {
    try {
        console.log('Started refreshing application (/) commands.');

        await axios.put(`${apiURL}/applications/${clientID}/guilds/${guildID}/commands`,
        slashCommands,
        {
            headers: {
                Authorization: `Bot ${token}`
            }
        });

        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.log(error);
    }
}

/**
 * unregister guild slash commands
 * 
 * @param {*} slashCommands 
 * @param {*} clientID 
 * @param {*} token 
 * @param {*} guildID 
 */
export async function deleteGuildSlashCommands(slashCommands, clientID, token, guildID) {
    try {
        const response = await axios.put(`${apiURL}/applications/${clientID}/guilds/${guildID}/commands`,
        slashCommands,
        {
            headers: {
                Authorization: `Bot ${token}`
            }
        });

        const data = response.data;

        for (let i = 0, n = data.length; i < n; i++) {
            setTimeout(() => {
                console.log(data[i]);
                console.log();

                axios.delete(`${apiURL}/applications/${clientID}/guilds/${guildID}/commands/${data[i].id}`,
                {
                    headers: {
                        Authorization: `Bot ${token}`
                    }
                });
            }, 5000 * i);
        }
    }
    catch (error) {
        console.log(error);
    }
}
