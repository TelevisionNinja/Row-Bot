module.exports = {
    executeIntervalFunc
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
 * @param {*} intervalFunc the interval function
 * @param {*} hour the hour of the next interval
 * @param {*} minute the minute of the next interval
 */
function createInterval(func, interval, intervalFunc, hour, minute) {
    const {
        timeRemaining,
        isNow
    } = get24HrWaitTime(hour, minute);

    if (!isNow) {
        clearTimeout(intervalFunc);
        
        return setTimeout(() => {
            func();

            const {
                newHr,
                newMin
            } = calcNewTime(interval, hour, minute);

            hour = newHr;
            minute = newMin;

            setInterval(() => {
                intervalFunc = createInterval(func, interval, intervalFunc, hour, minute);

                func();
    
                const {
                    newHr,
                    newMin
                } = calcNewTime(interval, hour, minute);
    
                hour = newHr;
                minute = newMin;
            }, interval * 60000);
        }, timeRemaining);
    }

    return intervalFunc;
}

/**
 * calculates the new time by adding the interval to it
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
 * executes a func at the given time
 * the time is 24 hr time
 * precision is of a minute
 * 
 * @param {*} func func to execute
 * @param {*} interval minutes between functino execution
 * @param {*} hour hour to send msg
 * @param {*} minute minute to send msg
 */
function executeIntervalFunc(func, interval, hour, minute) {
    const {
        newHr,
        newMin
    } = calcNewTime(interval, hour, minute);

    let intervalFunc;
    intervalFunc = createInterval(func, interval, intervalFunc, newHr, newMin);
}