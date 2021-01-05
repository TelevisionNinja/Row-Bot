module.exports = {
    startIntervalFunc
}

/**
 * returns the ms left until the specified time
 * if the start time is the durrent time, the isNow bool will be true
 * the time is 24 hr time
 * 
 * @param {*} hour hour of specified time
 * @param {*} minute minute of specified time
 */
function getMsUntilTime(hour, minute) {
    const nowTime = new Date();

    const deltaHours = hour - nowTime.getHours();
    const deltaMins = minute - nowTime.getMinutes();

    let deltaTime = deltaMins + 60 * deltaHours;

    if (deltaTime < 0) {
        deltaTime += 1440;
    }

    let isNow = false;
    let timeRemaining = 0;

    if (deltaTime) {
        timeRemaining = (60 * deltaTime - nowTime.getSeconds()) * 1000 - nowTime.getMilliseconds();
    }
    else {
        // 24 hours in ms
        timeRemaining = 86400000 - nowTime.getMilliseconds();
        isNow = true;
    }

    return {
        timeRemaining,
        isNow
    };
}

/**
 * 
 * @param {*} func the function to be executed
 * @param {*} interval minutes between function executions
 * @param {*} hour the hour of the next interval
 * @param {*} minute the minute of the next interval
 */
function createInterval(func, interval, hour, minute) {
    // calculate the next interval
    const {
        newHr,
        newMin
    } = calcNewIntervalTime(interval, hour, minute);

    // wait until the interval time
    setTimeout(() => {
        // execute the function
        func();
        
        // reset timeout
        createInterval(func, interval, newHr, newMin);
    }, getMsUntilTime(newHr, newMin).timeRemaining);
}

/**
 * calculates the next time
 * 
 * @param {*} interval minutes between intervals
 * @param {*} hour 
 * @param {*} minute 
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
 * @param {*} func func to execute
 * @param {*} interval minutes between function execution
 * @param {*} hour starting hour of the intervals
 * @param {*} minute starting minute of the intervals
 * @param {*} executeOnIntervalStart execute the function on the interval start time
 * @param {*} executeNow execute the function on the startIntervalFunc call
 */
function startIntervalFunc(func, interval, hour, minute, executeOnIntervalStart = false, executeNow = false) {
    if ((getMsUntilTime(hour, minute).isNow && executeOnIntervalStart) || executeNow) {
        func();
    }

    // prevent zero minute intervals
    if (!interval) {
        interval = 1;
    }

    createInterval(func, interval, hour, minute);
}