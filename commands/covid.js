const { covid } = require('../config.json');
const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
    names: covid.names,
    fileName: __filename,
    description: covid.description,
    args: true,
    guildOnly: false,
    usage: `<state>`,
    cooldown: 1,
    async execute(msg, args) {
        const data = await getData();
        msg.channel.send(dataToEmbed(args.join(' '), data));
    },
    getData,
    dataToStrArr,
    dataToEmbed
}

async function getData(nthDay = 0) {
    if (nthDay === 3) {
        return '';
    }
    
    let response;
    let results;

    try {
        response = await axios.get(getUrl(nthDay));
        results = response.data;
    }
    catch {
        results = await getData(nthDay + 1);
    }

    return results;
}

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

function dataEntryToData(state, data, precision = 2) {
    if (data.length === 0) {
        return ['Aww there\'s no results 😢'];
    }
    
    const states = data.split('\n');

    state = state.toLowerCase();

    let stateData = '';

    for (let i = 0, n = states.length; i < n; i++) {
        if (states[i].toLowerCase().startsWith(state)) {
            stateData = states[i];
            break;
        }
    }

    const dataArr = stateData.split(',');

    const stateName = dataArr[0];
    const lastUpdate = dataArr[2].split(' ').join(' at ');
    const confirmed	= parseInt(dataArr[5]);
    const deaths = parseInt(dataArr[6]);
    const recovered	= parseInt(dataArr[7]);
    const active = parseInt(dataArr[8]);

    // per 100,000 people
    const incidentRate = (parseFloat(dataArr[10]) / 1000).toFixed(precision);

    const totalTestResults = parseInt(dataArr[11]);
    const fatalityRatio = parseFloat(dataArr[13]).toFixed(precision);

    // per 100,000 people
    const testingRate =  (parseFloat(dataArr[16]) / 1000).toFixed(precision);

    const source = 'Data from Johns Hopkins University';

    return {
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

function dataToStrArr(state, data) {
    const {
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
    } = dataEntryToData(state, data);

    let stringArr = [];

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

function dataToEmbed(state, data) {
    const {
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
    } = dataEntryToData(state, data);

    const embed = new Discord.MessageEmbed()
        .setTitle(stateName)
        .setDescription(`Latest updated on ${lastUpdate} UTC`)
        .setFooter(source)
        .addFields(
            {
                name: 'Confirmed Cases',
                value: confirmed,
                inline: true
            },
            {
                name: 'Deaths',
                value: deaths,
                inline: true
            },
            {
                name: 'Recoveries',
                value: recovered,
                inline: true
            },
            {
                name: 'Active Cases',
                value: active,
                inline: true
            },
            {
                name: 'Incident Rate',
                value: `${incidentRate}%`,
                inline: true
            },
            {
                name: 'Total Tests',
                value: totalTestResults,
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
        );

    return embed;
}