module.exports = {
    send24HrIntervalMsg,
    execute24HrIntervalFunc,
    executeIntervalFunc
}

/**
 * returns the ms left till the specified time
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
        return 86400000 - time.getMilliseconds();
    }

    return (60 * deltaTime - time.getSeconds()) * 1000 - time.getMilliseconds();
}

/**
 * sends a msg at the given time
 * the time is 24 hr time
 * 
 * @param {*} client 
 * @param {*} isDM 
 * @param {*} ID 
 * @param {*} msg 
 * @param {*} hour hour to send msg
 * @param {*} minute minute to send msg
 */
async function send24HrIntervalMsg(client, isDM, ID, msg, hour, minute) {
    let receiver;

    if (isDM) {
        receiver = await client.users.fetch(ID);
    }
    else {
        receiver = client.channels.cache.get(ID);
    }

    let waitTime = get24HrWaitTime(hour, minute);

    setTimeout(async () => {
        receiver.send(msg);

        waitTime = get24HrWaitTime(hour, minute);

        setInterval(() => {
            receiver.send(msg);

            waitTime = get24HrWaitTime(hour, minute);
        }, waitTime);
    }, waitTime);
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
    let newMin = interval + minute;
    const carry = ~~(newMin / 60);
    newMin %= 60;
    const newHr = (carry + hour) % 24;

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