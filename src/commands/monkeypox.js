import config from '../../config/config.json' with { type: 'json' };
import PQueue from 'p-queue';
import { backOff } from '../lib/urlUtils.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { parse } from 'csv-parse/sync';
import { randomInteger } from '../lib/randomFunctions.js';

const commandConfig = config.monkeypox,
    noResultsMsg = config.noResultsMsg,
    color = parseInt(commandConfig.embedColor, 16);

const queueCases = new PQueue({
    interval: 1000,
    intervalCap: 100
});

export default {
    interactionData: {
        name: commandConfig.names[0],
        description: commandConfig.description,
        options: [
            {
                name: 'country',
                description: 'The country to get information of',
                required: true,
                type: ApplicationCommandOptionType.String
            }
        ]
    },
    names: commandConfig.names,
    description: commandConfig.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: `<country>`,
    cooldown: 1,
    async execute(msg, args) {
        // msg.reply({ embeds: [await getEmbed(args.join(' ').trimStart())] });
        msg.reply('This command is disabled');
    },
    async executeInteraction(interaction) {
        // const embeds = getEmbed(interaction.options.getString('country'));

        // await interaction.deferReply();

        // interaction.editReply({ embeds: [await embeds] });

        interaction.reply('This command is disabled');
    }
}

/**
 * 
 * @param {*} csv csv string
 * @returns array of array
 */
function parseCSV(csv) {
    return parse(csv, { skipEmptyLines: true });
}

/**
 * 
 * @param {*} country 
 * @param {*} parsedCSV use parseCSV()
 * @param {*} countryNameField 
 * @returns 
 */
function getCountryData(country, parsedCSV, countryNameField = 'COUNTRY') {
    country = country.toLowerCase();
    const columnNames = parsedCSV[0];
    let countryNameIndex = 0;

    for (let i = 0, n = columnNames.length; i < n; i++) {
        const name = columnNames[i];

        if (name === countryNameField) {
            countryNameIndex = i;
            break;
        }
    }

    let countryDataArray = [];

    // loop towards 1 bc the data is sorted by increasing date
    for (let i = parsedCSV.length - 1; i >= 1; i--) {
        const stateData = parsedCSV[i];

        if (stateData[countryNameIndex].toLowerCase().includes(country)) {
            countryDataArray = stateData;
            break;
        }
    }

    const countryDataMap = new Map();

    for (let i = 0, n = countryDataArray.length; i < n; i++) {
        countryDataMap.set(columnNames[i], countryDataArray[i]);
    }

    return countryDataMap;
}

//---------------------------------------------------------------

/**
 * 
 * @returns csv string
 */
export async function getCaseData() {
    let results = '';

    await queueCases.add(async () => {
        const response = await fetch('https://raw.githubusercontent.com/globaldothealth/monkeypox/main/who_latest.csv');

        if (backOff(response, queueCases)) {
            return;
        }

        results = await response.text();
    });

    return results;
}

/**
 * 
 * @param {Map} data use getCountryData()
 * @returns 
 */
function processCountryCaseData(data) {
    let countryName = '';
    let lastUpdate = '';
    let deaths = 0;
    let totalCases = 0;
    let source = '';
    let countryFound = false;

    if (data.size) {
        countryFound = true;
    }
    else {
        return {
            countryFound,
            countryName,
            lastUpdate,
            deaths,
            totalCases,
            source
        };
    }

    countryName = data.get('COUNTRY');
    lastUpdate = data.get('LASTREPDATE');
    deaths = parseInt(data.get('DeathsAll'), 10);
    totalCases = parseInt(data.get('CasesAll'), 10);
    source = `Global.health Monkeypox (accessed on ${new Date().toLocaleDateString('en-CA')})`;

    return {
        countryFound,
        countryName,
        lastUpdate,
        deaths,
        totalCases,
        source
    };
}

/**
 * 
 * @param {*} country 
 * @returns 
 */
export async function getEmbed(country) {
    const results = await Promise.all([
        getCaseData(),
        getRandomSymptoms()
    ]);
    const caseData = results[0];
    const symptoms = results[1];

    const {
        countryFound,
        countryName,
        lastUpdate,
        deaths,
        totalCases,
        source
    } = processCountryCaseData(getCountryData(country, parseCSV(caseData)));

    if (countryFound) {
        return {
            title: `${countryName} Cases`,
            description: `Last updated on ${lastUpdate}`,
            footer: { text: source },
            color: color,
            fields: [
                {
                    name: 'Total Cases',
                    value: `${totalCases}`,
                    inline: true
                },
                {
                    name: 'Total Deaths',
                    value: `${deaths}`,
                    inline: true
                },
                {
                    name: 'Symptoms',
                    value: `${symptoms}`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg,
        color: color
    };
}

//---------------------------------------------------------------

/**
 * 
 * @returns json
 */
export async function getIndividualData() {
    let results = '';

    await queueCases.add(async () => {
        const response = await fetch('https://raw.githubusercontent.com/globaldothealth/monkeypox/main/latest_deprecated.csv');

        if (backOff(response, queueCases)) {
            return;
        }

        results = await response.text();
    });

    return results;
}

/**
 * 
 * @param {*} cases 
 * @returns 
 */
export async function getRandomSymptoms(cases = null, index = 0) {
    if (cases === null) {
        cases = parseCSV(await getIndividualData());

        // find index of 'Symptoms' field
        const columnNames = cases[0];

        for (let i = 0, n = columnNames.length; i < n; i++) {
            const name = columnNames[i];

            if (name === 'Symptoms') {
                index = i;
                break;
            }
        }
    }

    const symptoms = cases[randomInteger(1, cases.length)][index];

    if (symptoms.length === 0) {
        return getRandomSymptoms(cases, index);
    }

    return symptoms;
}
