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
 * @param {*} hour hour of the current interval
 * @param {*} minute minute of the current interval
 * @param {*} interval minutes between intervals, default value is 1440 mins (1 day)
 */
function getMsUntilInterval(hour, minute, interval = 1440) {
    let isNow = false;
    let overshoot = false;
    let undershoot = false;
    let timeRemaining = 0;

    const nowTime = new Date();

    const deltaHours = hour - nowTime.getHours();
    const deltaMins = minute - nowTime.getMinutes();
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

        timeRemaining = (60 * deltaTime - nowTime.getSeconds()) * 1000;
    }
    else {
        // convert interval minutes to milliseconds
        timeRemaining = 60000 * interval;
        isNow = true;
    }

    timeRemaining -= nowTime.getMilliseconds();

    return {
        timeRemaining,
        isNow,
        overshoot,
        undershoot
    };
}

/**
 * creates the interval
 * 
 * @param {*} func the function to be executed at every interval
 * @param {*} interval minutes between intervals
 * @param {*} hour starting hour of the intervals
 * @param {*} minute starting minute of the intervals
 * @param {*} currentIntervalHr the current interval hour
 * @param {*} currentIntervalMin the current interval minute
 */
function createInterval(func, interval, hour, minute, currentIntervalHr, currentIntervalMin) {
    let {
        timeRemaining,
        undershoot
    } = getMsUntilInterval(currentIntervalHr, currentIntervalMin, interval);

    if (!undershoot) {
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
    if ((getMsUntilInterval(hour, minute).isNow && executeOnIntervalStart) || executeNow) {
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