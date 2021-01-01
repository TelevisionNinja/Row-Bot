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
function get24HrWaitTime(hour, minute) {
    const time = new Date();

    const deltaHours = hour - time.getHours();
    const deltaMins = minute - time.getMinutes();

    let deltaTime = deltaMins + 60 * deltaHours;

    if (deltaTime < 0) {
        deltaTime += 1440;
    }

    let isNow = false;
    let timeRemaining = 0;

    if (deltaTime) {
        timeRemaining = (60 * deltaTime - time.getSeconds()) * 1000 - time.getMilliseconds();
    }
    else {
        // 24 hours in ms
        timeRemaining = 86400000 - time.getMilliseconds();
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
 * @param {*} intervalID the interval ID
 * @param {*} hour the hour of the next interval
 * @param {*} minute the minute of the next interval
 */
function createInterval(func, interval, intervalID, hour, minute) {
    const {
        timeRemaining,
        isNow
    } = get24HrWaitTime(hour, minute);

    // check for drift
    if (!isNow) {
        clearTimeout(intervalID);
        
        return setTimeout(() => { // wait until the interval time
            // execute the function and calculate the next interval
            const {
                newHr,
                newMin
            } = executeFunc(func, interval, hour, minute);

            hour = newHr;
            minute = newMin;

            // set the interval
            setInterval(() => {
                // check for drift
                intervalID = createInterval(func, interval, intervalID, hour, minute);
                
                const {
                    newHr,
                    newMin
                } = executeFunc(func, interval, hour, minute);
                
                hour = newHr;
                minute = newMin;
            }, interval * 60000); // convert interval minutes to ms
        }, timeRemaining);
    }

    return intervalID;
}

/**
 * executes the function and calculates the next interval
 * 
 * @param {*} func function to be executed
 * @param {*} interval minutes between function executions
 * @param {*} hour hour to calculate next interval
 * @param {*} minute minute to calculate next interval
 */
function executeFunc(func, interval, hour, minute) {
    // execute the function
    func();
    
    // calculate the next interval
    return {
        newHr,
        newMin
    } = calcNewTime(interval, hour, minute);
}

/**
 * calculates the next time
 * 
 * @param {*} interval minutes between intervals
 * @param {*} hour 
 * @param {*} minute 
 */
function calcNewTime(interval, hour, minute) {
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
 * @param {*} executeOnNow 
 */
function startIntervalFunc(func, interval, hour, minute, executeOnNow = false) {
    if (get24HrWaitTime(hour, minute).isNow && executeOnNow) {
        func();
    }

    // calculate the next interval
    const {
        newHr,
        newMin
    } = calcNewTime(interval, hour, minute);

    let intervalID;
    intervalID = createInterval(func, interval, intervalID, newHr, newMin);
}