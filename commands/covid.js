import { default as config } from '../config.json';
import axios from 'axios';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const covid = config.covid,
    noResultsMsg = config.noResultsMsg;

const queueTests = new PQueue({
    interval: 1000,
    intervalCap: 100
});

const queueVaccines = new PQueue({
    interval: 1000,
    intervalCap: 50
});

const queuePopulation = new PQueue({
    interval: 1000,
    intervalCap: 100
});

export default {
    names: covid.names,
    description: covid.description,
    argsRequired: true,
    argsOptional: false,
    noSpecialChars: false,
    guildOnly: false,
    usage: `<state>`,
    cooldown: 1,
    async execute(msg, args) {
        msg.channel.send({ embeds: await getDataEmbeds(args.join(' ').trim()) });
    }
}

/**
 * 
 * @param {*} state 
 * @param {*} csvStr 
 * @returns 
 */
function getStateDataLine(state, csvStr) {
    const states = csvStr.split('\n');

    state = state.toLowerCase();

    let stateData = '';

    for (let i = 1, n = states.length; i < n; i++) {
        if (states[i].toLowerCase().includes(state)) {
            stateData = states[i];
            break;
        }
    }

    return stateData;
}

//---------------------------------------------------------------

/**
 * creates a url to get covid data
 * 
 * @param {*} nthDayAgo 
 * @returns url string
 */
function getTestURL(nthDayAgo) {
    let dateObj = new Date();

    dateObj.setUTCDate(dateObj.getUTCDate() - nthDayAgo);

    const month = dateObj.getUTCMonth() + 1;
    let monthStr = `${month}`;

    if (month < 10) {
        monthStr = `0${monthStr}`;
    }

    const day = dateObj.getUTCDate();
    let dayStr = `${day}`;

    if (day < 10) {
        dayStr = `0${dayStr}`;
    }

    return `${covid.dataURL}${monthStr}-${dayStr}-${dateObj.getUTCFullYear()}.csv`;
}

/**
 * returns a csv of the latest us state covid data
 * 
 * @param {*} nthDay 
 * @returns csv string
 */
export async function getTestData(nthDay = 0) {
    let results = '';

    // limit recursion
    if (nthDay === 5) {
        return results;
    }

    await queueTests.add(async () => {
        try {
            const response = await axios.get(getTestURL(nthDay));
            results = response.data;
        }
        catch (error) {
            if (!backOff(error, queueTests)) {
                results = await getTestData(nthDay + 1);
            }
        }
    });

    return results;
}

/**
 * gets a states data from the csv
 * 
 * @param {*} stateData use getStateDataLine()
 * @param {*} precision 
 * @returns 
 */
function extractStateTestData(stateData, precision = 2) {
    let stateName = '';
    let lastUpdate = '';
    let confirmed = 0;
    let deaths = 0;
    let recovered = 0;
    let active = 0;

    // per 100,000 people
    let incidenceRate = 0.0;

    let totalTestResults = 0;
    let fatalityRatio = 0.0;

    // per 100,000 people
    let testingPercentage = 0.0;

    let source = '';

    let stateFound = false;

    if (stateData.length) {
        stateFound = true;
    }
    else {
        return {
            stateFound,
            stateName,
            lastUpdate,
            confirmed,
            deaths,
            recovered,
            active,
            incidenceRate,
            totalTestResults,
            fatalityRatio,
            testingPercentage,
            source
        };
    }

    const dataArr = stateData.split(',');

    stateName = dataArr[0];
    lastUpdate = dataArr[2].split(' ').join(' at ');
    confirmed = parseInt(dataArr[5]);
    deaths = parseInt(dataArr[6]);
    recovered = parseInt(dataArr[7]);
    active = parseInt(dataArr[8]);

    // per 100,000 people
    incidenceRate = (parseFloat(dataArr[10]) / 1000).toFixed(precision);

    totalTestResults = parseInt(dataArr[11]);
    fatalityRatio = parseFloat(dataArr[13]).toFixed(precision);

    // per 100,000 people
    testingPercentage = (parseFloat(dataArr[16]) / 1000).toFixed(precision);

    source = 'Data from Johns Hopkins University';

    return {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    };
}

/**
 * puts a state's data into a string array
 * 
 * @param {*} data use extractStateTestData()
 * @returns 
 */
export function testDataToStrArr(data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    } = data;

    let stringArr = [];

    if (!stateFound) {
        stringArr.push(noResultsMsg);
        return stringArr;
    }

    stringArr.push(stateName);
    stringArr.push(`Last Update: ${lastUpdate} UTC`);
    stringArr.push(`Confirmed Cases: ${confirmed}`);
    stringArr.push(`Deaths: ${deaths}`);
    stringArr.push(`Recoveries: ${recovered}`);
    stringArr.push(`Active Cases: ${active}`);
    stringArr.push(`Incidence Rate: ${incidenceRate}%`);
    stringArr.push(`Total Tests: ${totalTestResults}`);
    stringArr.push(`Fatality: ${fatalityRatio}%`);
    stringArr.push(`Population Tested: ${testingPercentage}%`);
    stringArr.push(source);

    return stringArr;
}

/**
 * puts a state's data into an embed
 * 
 * @param {*} data use extractStateTestData()
 * @returns 
 */
export function createTestEmbed(data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        // recovered,
        // active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    } = data;

    if (stateFound) {
        return {
            title: `${stateName} Cases`,
            description: `Last updated on ${lastUpdate} UTC`,
            footer: { text: source },
            color: parseInt(covid.embedColor, 16),
            fields: [
                {
                    name: 'Confirmed Cases',
                    value: `${confirmed}`,
                    inline: true
                },
                {
                    name: 'Deaths',
                    value: `${deaths}`,
                    inline: true
                },
                // {
                //     name: 'Recoveries',
                //     value: recovered,
                //     inline: true
                // },
                // {
                //     name: 'Active Cases',
                //     value: active,
                //     inline: true
                // },
                {
                    name: 'Incidence Rate',
                    value: `${incidenceRate}%`,
                    inline: true
                },
                {
                    name: 'Total Tests',
                    value: `${totalTestResults}`,
                    inline: true
                },
                {
                    name: 'Fatality Percentage',
                    value: `${fatalityRatio}%`,
                    inline: true
                },
                {
                    name: 'Population Tested',
                    value: `${testingPercentage}%`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg,
        color: parseInt(covid.embedColor, 16)
    };
}

//---------------------------------------------------------------

/**
 * 
 * @returns csv string
 */
export async function getVaccineData() {
    let results = '';

    await queueVaccines.add(async () => {
        try {
            const response = await axios.get(covid.vaccineURL);
            results = response.data;
        }
        catch (error) {
            backOff(error, queueVaccines);
        }
    });

    return results;
}

/**
 * gets a states data from the csv
 * 
 * @param {*} stateData use getStateDataLine()
 * @returns 
 */
function extractStateVaccineData(stateData) {
    let stateName = '';
    let lastUpdate = '';
    let fullyVaccinated = 0;
    let partiallyVaccinated = 0;
    let totalVaccinated = 0;

    let source = '';

    let stateFound = false;

    if (stateData.length) {
        stateFound = true;
    }
    else {
        return {
            stateFound,
            stateName,
            lastUpdate,
            fullyVaccinated,
            partiallyVaccinated,
            totalVaccinated,
            source
        };
    }

    const dataArr = stateData.split(',');

    stateName = dataArr[1];
    lastUpdate = dataArr[3];
    fullyVaccinated = parseInt(dataArr[8]);
    partiallyVaccinated = parseInt(dataArr[9]);
    totalVaccinated = fullyVaccinated + partiallyVaccinated;

    source = 'Data from Johns Hopkins University';

    return {
        stateFound,
        stateName,
        lastUpdate,
        fullyVaccinated,
        partiallyVaccinated,
        totalVaccinated,
        source
    };
}

/**
 * puts a state's data into an embed
 * 
 * @param {*} data use extractStateVaccineData()
 * @returns 
 */
export function createVaccineEmbed(data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        fullyVaccinated,
        partiallyVaccinated,
        totalVaccinated,
        source
    } = data;

    if (stateFound) {
        return {
            title: `${stateName} Vaccinations`,
            description: `Last updated on ${lastUpdate}`,
            footer: { text: source },
            color: parseInt(covid.embedColor, 16),
            fields: [
                {
                    name: 'Fully Vaccinated',
                    value: `${fullyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Partially Vaccinated',
                    value: `${partiallyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Vaccinated Total',
                    value: `${totalVaccinated}`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg,
        color: parseInt(covid.embedColor, 16)
    };
}

//---------------------------------------------------------------

/**
 * creates a url to get population data
 * 
 * @param {*} yearOffset 
 * @returns url string
 */
function getPopulationURL(yearOffset) {
    let dateObj = new Date();

    dateObj.setUTCFullYear(dateObj.getUTCFullYear() - yearOffset);

    return `https://api.census.gov/data/${dateObj.getUTCFullYear()}/pep/population?get=NAME,POP&for=state:*`;
}

/**
 * 
 * @param {*} yearOffset 
 * @returns array string
 */
export async function getPopulationData(yearOffset = 0) {
    let results = '';

    // limit recursion
    if (yearOffset === 5) {
        return results;
    }

    await queuePopulation.add(async () => {
        try {
            const response = await axios.get(getPopulationURL(yearOffset));
            results = response.data;
        }
        catch (error) {
            if (!backOff(error, queuePopulation)) {
                results = await getPopulationData(yearOffset + 1);
            }
        }
    });

    return results;
}

/**
 * 
 * @param {*} state 
 * @param {*} data use getPopulationData()
 * @returns -1 if no data is found
 */
export function getStatePopulation(state, data) {
    let result = -1;
    state = state.toLowerCase();

    for (let i = 0, n = data.length; i < n; i++) {
        const current = data[i];

        if (current[0].toLowerCase().startsWith(state)) {
            result = parseInt(current[1]);
            break;
        }
    }

    return result;
}

//---------------------------------------------------------------

/**
 * 
 * @param {*} state 
 * @param {*} precision 
 * @returns embed array
 */
export async function getDataEmbeds(state, precision = 2) {
    const response = await Promise.all([
        getTestData(),
        getVaccineData(),
        getPopulationData()
    ]);

    const testData = response[0];
    const vaccineData = response[1];
    const populationData = response[2];

    if (testData.length) {
        let embeds = [
            createTestEmbed(extractStateTestData(getStateDataLine(state, testData), precision))
        ];
        const vaccineStateData = extractStateVaccineData(getStateDataLine(state, vaccineData));
        let vaccineEmbed = createVaccineEmbed(vaccineStateData);

        if (typeof vaccineEmbed.description !== 'undefined') {
            if (populationData.length) {
                const population = getStatePopulation(state, populationData);
    
                if (population !== -1) {
                    vaccineEmbed.fields = [
                        ...vaccineEmbed.fields,
                        {
                            name: 'Population Estimate',
                            value: `${population}`,
                            inline: true
                        },
                        {
                            name: 'Vaccinated Percentage',
                            value: `${(vaccineStateData.totalVaccinated / population * 100).toFixed(precision)}%`,
                            inline: true
                        }
                    ];
    
                    vaccineEmbed.footer.text = `${vaccineEmbed.footer.text} & US Census Bureau`;
                }
            }

            embeds.push(vaccineEmbed);
        }

        return embeds;
    }

    return [];
}

/**
 * 
 * @param {*} state 
 * @param {*} precision 
 * @returns embed object
 */
export async function getCombinedEmbed(state, precision = 2) {
    const response = await Promise.all([
        getTestData(),
        getVaccineData(),
        getPopulationData()
    ]);

    const {
        stateFound,
        confirmed,
        deaths,
        // recovered,
        // active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    } = extractStateTestData(getStateDataLine(state, response[0]), precision);

    if (stateFound) {
        const {
            stateName,
            lastUpdate,
            fullyVaccinated,
            partiallyVaccinated,
            totalVaccinated
        } = extractStateVaccineData(getStateDataLine(state, response[1]));
        const population = getStatePopulation(state, response[2]);

        return {
            title: `${stateName}`,
            description: `Last updated on ${lastUpdate}`,
            footer: { text: `${source} & US Census Bureau`},
            color: parseInt(covid.embedColor, 16),
            fields: [
                {
                    name: 'Confirmed Cases',
                    value: `${confirmed}`,
                    inline: true
                },
                {
                    name: 'Deaths',
                    value: `${deaths}`,
                    inline: true
                },
                // {
                //     name: 'Recoveries',
                //     value: recovered,
                //     inline: true
                // },
                // {
                //     name: 'Active Cases',
                //     value: active,
                //     inline: true
                // },
                {
                    name: 'Incidence Rate',
                    value: `${incidenceRate}%`,
                    inline: true
                },
                {
                    name: 'Total Tests',
                    value: `${totalTestResults}`,
                    inline: true
                },
                {
                    name: 'Fatality Percentage',
                    value: `${fatalityRatio}%`,
                    inline: true
                },
                {
                    name: 'Population Tested',
                    value: `${testingPercentage}%`,
                    inline: true
                },
                {
                    name: 'Fully Vaccinated',
                    value: `${fullyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Partially Vaccinated',
                    value: `${partiallyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Vaccinated Total',
                    value: `${totalVaccinated}`,
                    inline: true
                },
                {
                    name: 'Population Estimate',
                    value: `${population}`,
                    inline: true
                },
                {
                    name: 'Vaccinated Percentage',
                    value: `${(totalVaccinated / population * 100).toFixed(precision)}%`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg,
        color: parseInt(covid.embedColor, 16)
    };
}
