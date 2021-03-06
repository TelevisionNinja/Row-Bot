import { default as config } from '../config.json';
import axios from 'axios';
import PQueue from 'p-queue';
import { backOff } from '../lib/limit.js';

const covid = config.covid,
    noResultsMsg = config.noResultsMsg;

const queue = new PQueue({
    interval: 1000,
    intervalCap: 10
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
        const data = await getData();

        if (data.length) {
            msg.channel.send(dataToEmbed(args.join(' '), data));
        }
        else {
            msg.channel.send('I couldn\'t get any data for some reason');
        }
    }
}

/**
 * returns a csv of the latest us state covid data
 * 
 * @param {*} nthDay 
 */
export async function getData(nthDay = 1) {
    let results = '';

    if (nthDay === 3) {
        return results;
    }

    await queue.add(async () => {
        try {
            const response = await axios.get(getUrl(nthDay));
            results = response.data;
        }
        catch (error) {
            if (!backOff(error, queue)) {
                results = await getData(nthDay + 1);
            }
        }
    });

    return results;
}

/**
 * creates a url to get covid data
 * 
 * @param {*} nthDayAgo 
 */
function getUrl(nthDayAgo) {
    let dateObj = new Date();
    // previous day shows today's data
    dateObj.setDate(dateObj.getDate() - nthDayAgo);

    let dateStr = '';

    let month = (dateObj.getUTCMonth() + 1).toString();

    if (month.length < 2) {
        month = `0${month}`;
    }

    let day = dateObj.getUTCDate().toString();

    if (day.length < 2) {
        day = `0${day}`;
    }

    dateStr = `${month}-${day}-${dateObj.getUTCFullYear()}`;

    return `${covid.dataURL}${dateStr}.csv`;
}

/**
 * gets a states data from the csv
 * 
 * @param {*} state 
 * @param {*} data 
 * @param {*} precision 
 */
function dataToStateData(state, data, precision = 2) {
    let stateName = '';
    let lastUpdate = '';
    let confirmed = 0;
    let deaths = 0;
    let recovered = 0;
    let active = 0;

    // per 100,000 people
    let incidentRate = 0.0;

    let totalTestResults = 0;
    let fatalityRatio = 0.0;

    // per 100,000 people
    let testingRate = 0.0;

    let source = '';

    let stateFound = false;

    if (!data.length) {
        return {
            stateFound,
            stateName,
            lastUpdate,
            confirmed,
            deaths,
            recovered,
            active,
            incidentRate,
            totalTestResults,
            fatalityRatio,
            testingRate,
            source
        };
    }
    
    const states = data.split('\n');

    state = state.toLowerCase();

    let stateData = '';

    for (let i = 0, n = states.length; i < n; i++) {
        if (states[i].toLowerCase().startsWith(state)) {
            stateData = states[i];
            stateFound = true;
            break;
        }
    }

    if (!stateFound) {
        return {
            stateFound,
            stateName,
            lastUpdate,
            confirmed,
            deaths,
            recovered,
            active,
            incidentRate,
            totalTestResults,
            fatalityRatio,
            testingRate,
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
    incidentRate = (parseFloat(dataArr[10]) / 1000).toFixed(precision);

    totalTestResults = parseInt(dataArr[11]);
    fatalityRatio = parseFloat(dataArr[13]).toFixed(precision);

    // per 100,000 people
    testingRate = (parseFloat(dataArr[16]) / 1000).toFixed(precision);

    source = 'Data from Johns Hopkins University';

    return {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active,
        incidentRate,
        totalTestResults,
        fatalityRatio,
        testingRate,
        source
    };
}

/**
 * puts a state's data into a string array
 * 
 * @param {*} state 
 * @param {*} data 
 */
export function dataToStrArr(state, data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active,
        incidentRate,
        totalTestResults,
        fatalityRatio,
        testingRate,
        source
    } = dataToStateData(state, data);

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
    stringArr.push(`Incident Rate: ${incidentRate}%`);
    stringArr.push(`Total Tests: ${totalTestResults}`);
    stringArr.push(`Fatality: ${fatalityRatio}%`);
    stringArr.push(`Testing Rate: ${testingRate}%`);
    stringArr.push(source);

    return stringArr;
}

/**
 * puts a state's data into an embed
 * 
 * @param {*} state 
 * @param {*} data 
 */
export function dataToEmbed(state, data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        // recovered,
        // active,
        incidentRate,
        totalTestResults,
        fatalityRatio,
        testingRate,
        source
    } = dataToStateData(state, data);

    if (stateFound) {
        return {
            embeds: [{
                title: stateName,
                description: `Latest updated on ${lastUpdate} UTC`,
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
                        name: 'Incident Rate',
                        value: `${incidentRate}%`,
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
                        name: 'Testing Rate',
                        value: `${testingRate}%`,
                        inline: true
                    }
                ]
            }]
        };
    }

    return {
        embeds: [{
            title: noResultsMsg,
            color: parseInt(covid.embedColor, 16)
        }]
    };
}