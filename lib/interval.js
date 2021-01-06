module.exports = {
    startIntervalFunc
}

/**
 * returns the ms left until the specified time
 * if the start time is the current time, the isNow bool will be true and the time remaining is the provided interval
 * the time is 24 hr time
 * 
 * @param {*} hour hour of specified time
 * @param {*} minute minute of specified time
 * @param {*} interval minutes between intervals
 */
function getMsUntilTime(hour, minute, interval = 1440) {
    const nowTime = new Date();

    const deltaHours = hour - nowTime.getHours();
    const deltaMins = minute - nowTime.getMinutes();

    let deltaTime = deltaMins + 60 * deltaHours;

    if (deltaTime < 0) {
        // 24 hours in minutes
        deltaTime += 1440;
    }

    let isNow = false;
    let timeRemaining = 0;

    if (deltaTime) {
        timeRemaining = (60 * deltaTime - nowTime.getSeconds()) * 1000 - nowTime.getMilliseconds();
    }
    else {
        // convert interval minutes to milliseconds
        timeRemaining = interval * 60000 - nowTime.getMilliseconds();
        isNow = true;
    }

    return {
        timeRemaining,
        isNow
    };
}

/**
 * 
 * @param {*} func the function to be executed at every interval
 * @param {*} interval minutes between intervals
 * @param {*} hour starting hour of the intervals
 * @param {*} minute starting minute of the intervals
 * @param {*} currentIntervalHr the current interval hour
 * @param {*} currentIntervalMin the current interval minute
 */
function createInterval(func, interval, hour, minute, currentIntervalHr, currentIntervalMin) {
    const {
        timeRemaining,
        isNow
    } = getMsUntilTime(currentIntervalHr, currentIntervalMin, interval);

    if (isNow) {
        // execute the function
        func();

        // calculate the next interval
        const {
            newHr,
            newMin
        } = calcNewIntervalTime(interval, hour, minute);

        currentIntervalHr = newHr;
        currentIntervalMin = newMin;
    }
    
    // wait until the interval time
    setTimeout(() => {
        // reset timeout
        createInterval(func, interval, hour, minute, currentIntervalHr, currentIntervalMin);
    }, timeRemaining);
}

/**
 * calculates the next interval time based on the current time and the starting time
 * 
 * @param {*} interval minutes between intervals
 * @param {*} hour starting hour of the intervals
 * @param {*} minute starting minute of the intervals
 */
function calcNewIntervalTime(interval, hour, minute) {
    const startInMins = hour * 60 + minute;

    const time = new Date();

    let deltaFromStart = 60 * time.getHours() + time.getMinutes() - startInMins;

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
 * executes a func at the given interval
 * if the given start time is the current time, the function will be executed on the next interval
 * the time is 24 hr time
 * precision is of a minute
 * 
 * @param {*} func func to execute at every interval
 * @param {*} interval minutes between intervals
 * @param {*} hour starting hour of the intervals
 * @param {*} minute starting minute of the intervals
 * @param {*} executeOnIntervalStart execute the function on the interval start time
 * @param {*} executeNow execute the function on the startIntervalFunc call
 */
function startIntervalFunc(func, interval, hour, minute, executeOnIntervalStart = false, executeNow = false) {
    if ((getMsUntilTime(hour, minute).isNow && executeOnIntervalStart) || executeNow) {
        func();
    }

    // prevent less than 1 minute intervals
    if (interval < 1) {
        interval = 1;
    }

    // calculate the next interval
    const {
        newHr,
        newMin
    } = calcNewIntervalTime(interval, hour, minute);

    createInterval(func, interval, hour, minute, newHr, newMin);
}