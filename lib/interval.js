module.exports = {
    startIntervalFunc
}

/**
 * returns the ms left until the current interval
 * if the current time is the current interval, the 'isNow' boolean will be true, and the time remaining will be returned as the provided interval
 * if the current time is after the current interval, the boolean 'overshoot' will be returned as true, and the time remaining will be returned as the time until the next interval
 * if the current time is before the current interval, the boolean 'undershoot' will be returned as true, and the time remaining will be returned as the time until the current interval
 * 
 * the time is 24 hr time
 * 
 * @param {*} currentIntervalHr hour of the current interval
 * @param {*} currentIntervalMin minute of the current interval
 * @param {*} currentHr current hour
 * @param {*} currentMin current minute
 * @param {*} currentSec current second
 * @param {*} currentMs current millisecond
 * @param {*} interval minutes between intervals, default value is 1440 mins (1 day)
 */
function getMsUntilIntervalTime(currentIntervalHr, currentIntervalMin, currentHr, currentMin, currentSec, currentMs, interval = 1440) {
    let isNow = false;
    let overshoot = false;
    let undershoot = false;

    const deltaHours = currentIntervalHr - currentHr;
    const deltaMins = currentIntervalMin - currentMin;
    let deltaTime = 60 * deltaHours + deltaMins;

    if (deltaTime) {
        if (deltaTime > 0) {
            undershoot = true;
        }
        else {
            const n = ~~(-deltaTime / interval) + 1;
            deltaTime += interval * n;
            overshoot = true;
        }
    }
    else {
        deltaTime = interval;
        isNow = true;
    }

    const timeRemaining = (60 * deltaTime - currentSec) * 1000 - currentMs;

    return {
        timeRemaining,
        isNow,
        overshoot,
        undershoot
    };
}

/**
 * calculates the next interval time based on the current time and the starting time
 * 
 * @param {*} interval minutes between intervals
 * @param {*} startHour starting hour of the intervals
 * @param {*} startMin starting minute of the intervals
 * @param {*} currentHr current hour
 * @param {*} currentMin current minute
 */
function calcNextIntervalTime(interval, startHour, startMin, currentHr, currentMin) {
    const startInMins = startHour * 60 + startMin;
    let deltaFromStart = 60 * currentHr + currentMin - startInMins;

    if (deltaFromStart < 0) {
        deltaFromStart += 1440;
    }

    const n = ~~(deltaFromStart / interval) + 1;
    let newMin = interval * n + startInMins;
    const newHr = ~~(newMin / 60) % 24;
    newMin %= 60;

    return {
        newHr,
        newMin
    }
}

/**
 * continues the interval
 * 
 * @param {*} func the function to be executed at every interval
 * @param {*} interval minutes between intervals
 * @param {*} startHr starting hour of the intervals
 * @param {*} startMin starting minute of the intervals
 * @param {*} currentIntervalHr the current interval hour
 * @param {*} currentIntervalMin the current interval minute
 */
function continueInterval(func, interval, startHr, startMin, currentIntervalHr, currentIntervalMin) {
    const time = new Date();
    const currentHr = time.getHours();
    const currentMin = time.getMinutes();

    const {
        timeRemaining,
        undershoot
    } = getMsUntilIntervalTime(currentIntervalHr, currentIntervalMin, currentHr, currentMin, time.getSeconds(), time.getMilliseconds(), interval);

    if (!undershoot) {
        // execute the function
        func();

        // calculate the next interval
        const {
            newHr,
            newMin
        } = calcNextIntervalTime(interval, startHr, startMin, currentHr, currentMin);

        currentIntervalHr = newHr;
        currentIntervalMin = newMin;
    }

    // wait until the interval time
    setTimeout(() => {
        // reset timeout
        continueInterval(func, interval, startHr, startMin, currentIntervalHr, currentIntervalMin);
    }, timeRemaining);
}

/**
 * creates the interval
 * 
 * @param {*} func the function to be executed at every interval
 * @param {*} interval minutes between intervals
 * @param {*} startHr starting hour of the intervals
 * @param {*} startMin starting minute of the intervals
 */
function createInterval(func, interval, startHr, startMin) {
    const time = new Date();
    const currentHr = time.getHours();
    const currentMin = time.getMinutes();

    // calculate the next interval
    const {
        newHr,
        newMin
    } = calcNextIntervalTime(interval, startHr, startMin, currentHr, currentMin);

    // wait until the interval time
    setTimeout(() => {
        // reset timeout
        continueInterval(func, interval, startHr, startMin, newHr, newMin);
    }, getMsUntilIntervalTime(newHr, newMin, currentHr, currentMin, time.getSeconds(), time.getMilliseconds(), interval).timeRemaining);
}

/**
 * executes a func at the given interval
 * if the given start time is the current time, the function will be executed on the next interval
 * the time is 24 hr time
 * precision is of a minute
 * 
 * @param {*} func func to execute at every interval
 * @param {*} interval minutes between intervals
 * @param {*} startHr starting hour of the intervals
 * @param {*} startMin starting minute of the intervals
 * @param {*} executeNow execute the function on the startIntervalFunc call
 */
function startIntervalFunc(func, interval, startHr, startMin, executeNow = false) {
    if (executeNow) {
        func();
    }

    // prevent less than 1 minute intervals
    if (interval < 1) {
        interval = 1;
    }

    createInterval(func, interval, startHr, startMin);
}