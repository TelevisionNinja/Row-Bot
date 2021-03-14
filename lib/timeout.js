const { performance } = require('perf_hooks');

module.exports = {
    createTimeout,
    createInterval,
    deleteTimeout,
    deleteInterval
}

// array of IDs so that the timers can be cleared
const IDs = [];
// variable to keep track of and return a new ID
let newID = 0;

/*
formula for timeout times:

recursive formula (geometric)
t(0) = givenTime
t(n) = (1 / denominator) * t(n - 1)

closed formula
t = givenTime * (1 / denominator)^n

default denominator is 2 
*/
const denominator = 2;

/**
 * this calls a specified function to get a timestamp
 * performance.now() is the default
 * 
 * @returns timestamp
 */
function getTime() {
    /*
    other timestamp functions

    -------------------------

    const time = process.hrtime();
    return time[0] * 1000 + time[1] / 1000000; // ms

    -------------------------

    return Number(process.hrtime.bigint() / 1000000n); // ms

    -------------------------

    return Date.now();
    */

    return performance.now();
};

//-------------------------------------------------------------------------
// timeout

/**
 * calls timeout until the time has been reached
 * 
 * @param {*} callback 
 * @param {*} end 
 * @param {*} ID 
 */
function customTimeout(callback, end, ID) {
    IDs[ID] = setTimeout(() => {
        if (end > getTime()) {
            customTimeout(callback, end, ID);
        }
        else {
            callback();
        }
    }, (end - getTime()) / denominator);
}

/**
 * 
 * @param {*} callback 
 * @param {*} time 
 * @returns a ID
 */
function createTimeout(callback, time) {
    customTimeout(callback, time + getTime(), newID);
    return newID++;
}

//-------------------------------------------------------------------------
// interval

/**
 * calls timeout repeatedly
 * 
 * @param {*} callback 
 * @param {*} time 
 * @param {*} end 
 * @param {*} ID 
 */
function customInterval(callback, time, end, ID) {
    IDs[ID] = setTimeout(() => {
        if (end <= getTime()) {
            callback();
            end += time;
        }

        customInterval(callback, time, end, ID);
    }, (end - getTime()) / denominator);
}

/**
 * 
 * @param {*} callback 
 * @param {*} time 
 * @returns an ID
 */
function createInterval(callback, time) {
    customInterval(callback, time, time + getTime(), newID);
    return newID++;
}

//-------------------------------------------------------------------------
// clear functions

/**
 * deletes the timeout of the given ID
 * 
 * @param {*} ID 
 */
function deleteTimeout(ID) {
    clearTimeout(IDs[ID]);
}

/**
 * deletes the interval of the given ID
 * 
 * @param {*} ID 
 */
function deleteInterval(ID) {
    clearInterval(IDs[ID]);
}