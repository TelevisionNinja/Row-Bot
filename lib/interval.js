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
 * @param {*} currentInterval the current interval
 * @param {*} currentTime the current time in mins
 * @param {*} currentMs the current second and ms in ms
 * @param {*} interval minutes between intervals, default value is 1440 mins (1 day)
 */
function getMsUntilIntervalTime(currentInterval, currentTime, currentMs, interval = 1440) {
    let isNow = false;
    let overshoot = false;
    let undershoot = false;
    let deltaTime = currentInterval - currentTime;

    if (deltaTime) {
        if (deltaTime > 0) {
            undershoot = true;
        }
        else {
            deltaTime += (~~(-deltaTime / interval) + 1) * interval;
            overshoot = true;
        }
    }
    else {
        deltaTime = interval;
        isNow = true;
    }

    const timeRemaining = 60000 * deltaTime - currentMs;

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
 * @param {*} startTime starting time of the intervals in mins
 * @param {*} currentTime current time in mins
 */
function calcNextIntervalTime(interval, startTime, currentTime) {
    /*
        // formula
        // 'interval' and 'startTime' are assumed to be in minutes
        // division is assumed to be integer division

        // remove offset (startTime)
        delta = currentTime - startTime

        // assumed every day is 24 hours
        // add 24 hours in mins (carry) to negative numbers
        if (delta < 0) {
            delta += 1440
        }

        n = delta / interval + 1

        newInterval = interval * n + startTime

        // convert to hours and minutes

        newHr = newInterval / 60 % 24

        newMin = newInterval % 60;
     */

    let delta = currentTime - startTime;

    if (delta < 0) {
        delta += 1440;
    }

    return ((~~(delta / interval) + 1) * interval + startTime) % 1440;
}

/**
 * returns the current time in minutes and current second and millisecond in milliseconds
 */
function getTime() {
    const time = new Date();
    const currentTime = 60 * time.getHours() + time.getMinutes();
    const currentMs = 1000 * time.getSeconds() + time.getMilliseconds();

    return {
        currentTime,
        currentMs
    };
}

/**
 * continues the interval
 * 
 * @param {*} func the function to be executed at every interval
 * @param {*} interval minutes between intervals
 * @param {*} startTime starting time of the intervals in mins
 * @param {*} currentInterval current interval
 */
function continueInterval(func, interval, startTime, currentInterval) {
    const {
        currentTime,
        currentMs
    } = getTime();

    const {
        timeRemaining,
        undershoot
    } = getMsUntilIntervalTime(currentInterval, currentTime, currentMs, interval);

    if (!undershoot) {
        // execute the function
        func();

        // calculate the next interval
        currentInterval = calcNextIntervalTime(interval, startTime, currentTime);
    }

    // wait until the interval time
    setTimeout(() => {
        // reset timeout
        continueInterval(func, interval, startTime, currentInterval);
    }, timeRemaining);
}

/**
 * creates the interval
 * 
 * @param {*} func the function to be executed at every interval
 * @param {*} interval minutes between intervals
 * @param {*} startTime starting time of the intervals in mins
 */
function createInterval(func, interval, startTime) {
    const {
        currentTime,
        currentMs
    } = getTime();

    // calculate the next interval
    const newInterval = calcNextIntervalTime(interval, startTime, currentTime);

    // wait until the interval time
    setTimeout(() => {
        // reset timeout
        continueInterval(func, interval, startTime, newInterval);
    }, getMsUntilIntervalTime(newInterval, currentTime, currentMs, interval).timeRemaining);
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

    // convert to mins
    createInterval(func, interval, 60 * startHr + startMin);
}