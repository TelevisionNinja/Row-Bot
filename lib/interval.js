module.exports = {
    execute24HrIntervalFunc,
    executeIntervalFunc
}

/**
 * returns the ms left until the specified time
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

    if (!deltaTime) {
        // 24 hours in ms
        return 86400000 - time.getMilliseconds();
    }

    return (60 * deltaTime - time.getSeconds()) * 1000 - time.getMilliseconds();
}

/**
 * executes a func at the given time
 * the time is 24 hr time
 * 
 * @param {*} func func to execute
 * @param {*} hour hour to send msg
 * @param {*} minute minute to send msg
 */
function execute24HrIntervalFunc(func, hour, minute) {
    let waitTime = get24HrWaitTime(hour, minute);

    setTimeout(() => {
        func();

        waitTime = get24HrWaitTime(hour, minute);

        setInterval(() => {
            func();

            waitTime = get24HrWaitTime(hour, minute);
        }, waitTime);
    }, waitTime);
}

//------------------------------------------------------------------------------

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

    hour = newHr;
    minute = newMin;

    let waitTime = get24HrWaitTime(hour, minute);

    setTimeout(() => {
        func();

        const {
            newHr,
            newMin
        } = calcNewTime(interval, hour, minute);

        hour = newHr;
        minute = newMin;

        waitTime = get24HrWaitTime(hour, minute);

        setInterval(() => {
            func();

            const {
                newHr,
                newMin
            } = calcNewTime(interval, hour, minute);

            hour = newHr;
            minute = newMin;

            waitTime = get24HrWaitTime(hour, minute);
        }, waitTime);
    }, waitTime);
}