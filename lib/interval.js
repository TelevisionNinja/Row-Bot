const { performance } = require('perf_hooks');

module.exports = class Interval {
    // private vars
    #currentTime;
    #currentMs;
    #currentInterval;
    #timeoutID;

    // user's vars
    #func;
    #intervalStartTime;
    #interval;

    // timimg vars
    #timeRemaining;
    //#isNow;
    //#overshoot;
    //#undershoot;

    // timeout vars
    #timeoutEnd;

    //----------------------------------------------------------------------------------
    // constructor

    /**
     * constructs the interval object
     * 
     * @param {*} func func to execute at every interval
     * @param {*} intervalStartTime starting time of the intervals, format: hh:mm (24 hours)
     * @param {*} interval minutes between intervals
     */
    constructor(func, intervalStartTime, interval) {
        // user's vars
        this.func = func;
        this.intervalStartTime = intervalStartTime;
        this.interval = interval;

        // private vars
        this.#currentTime = 0;
        this.#currentMs = 0;
        this.#currentInterval = 0;
        this.#timeoutID = undefined;

        // timimg vars
        this.#timeRemaining = 0;
        //this.#isNow = false;
        //this.#overshoot = false;
        //this.#undershoot = false;

        // timeout vars
        this.#timeoutEnd = 0;
    }

    //----------------------------------------------------------------------------------
    // getters

    /**
     * returns the interval value
     */
    get interval() {
        return this.#interval;
    }

    /**
     * returns the interval starting time value
     */
    get intervalStartTime() {
        return this.#intervalStartTime;
    }

    //----------------------------------------------------------------------------------
    // setters

    /**
     * sets the mins between intervals
     * the lowest value is 1
     * 
     * @param {*} newInterval mins between intervals
     */
    set interval(newInterval) {
        // prevent less than 1 minute intervals
        if (newInterval < 1) {
            newInterval = 1;
        }

        this.#interval = newInterval;
    }

    /**
     * sets the function to be executed
     * 
     * @param {*} newFunc function to be executed
     */
    set func(newFunc) {
        this.#func = newFunc;
    }

    /**
     * sets the starting time of the intervals
     * 
     * @param {*} newIntervalStartTime starting time of the intervals
     */
    set intervalStartTime(newIntervalStartTime) {
        const startTimeArr = newIntervalStartTime.split(':').map(i => parseInt(i));
        this.#intervalStartTime = 60 * startTimeArr[0] + startTimeArr[1];
    }

    //----------------------------------------------------------------------------------
    // private methods

    /**
     * calculates the ms left until the current interval
     * if the current time is the current interval, the 'isNow' boolean will be true, and the time remaining will be the provided interval
     * if the current time is after the current interval, the boolean 'overshoot' will be true, and the time remaining will be the time until the next interval
     * if the current time is before the current interval, the boolean 'undershoot' will be true, and the time remaining will be the time until the current interval
     * 
     * the time is 24 hr time
     */
    #getMsUntilIntervalTime() {
        // reset booleans
        //this.#isNow = false;
        //this.#overshoot = false;
        //this.#undershoot = false;

        let deltaTime = this.#currentInterval - this.#currentTime;

        if (!deltaTime) {
            // now
            deltaTime = this.#interval;
            //this.#isNow = true;
        }
        else if (deltaTime < 0) {
            // overshoot
            deltaTime += (~~((0 - deltaTime) / this.#interval) + 1) * this.#interval;
            //this.#overshoot = true;
        }

        // added delay of 5 seconds
        this.#timeRemaining = 60000 * deltaTime - this.#currentMs + 5000;
    }

    /**
     * calculates the next interval time based on the current time and the interval starting time
     */
    #calcNextIntervalTime() {
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

        let delta = this.#currentTime - this.#intervalStartTime;

        if (delta < 0) {
            delta += 1440;
        }

        this.#currentInterval = ((~~(delta / this.#interval) + 1) * this.#interval + this.#intervalStartTime) % 1440;
    }

    /**
     * updates the current time in minutes and current second and millisecond in milliseconds
     */
    #updateTime() {
        const time = new Date();
        this.#currentTime = 60 * time.getHours() + time.getMinutes();
        this.#currentMs = 1000 * time.getSeconds() + time.getMilliseconds();
    }

    /**
     * calls timeout until the time has been reached
     */
    #customTimeout() {
        this.#timeoutID = setTimeout(() => {
            if (this.#timeoutEnd > performance.now()) {
                this.#customTimeout();
            }
            else {
                this.#createInterval();
            }
        }, (this.#timeoutEnd - performance.now()) / 2);
    }

    /**
     * creates a timeout
     * this tries to reduce drift
     */
    #createTimeout() {
        this.#timeoutEnd = this.#timeRemaining + performance.now();
        this.#customTimeout();
    }

    /**
     * creates the interval
     */
    #createInterval() {
        // execute the function
        this.#func();

        // update the time
        this.#updateTime();

        // calculate the next interval
        this.#calcNextIntervalTime();

        // calculate the time remaining until the next interval
        this.#getMsUntilIntervalTime();

        // wait until the interval time
        this.#createTimeout();
    }

    //----------------------------------------------------------------------------------
    // public methods

    /**
     * starts the interval
     * if the given start time is the current time, the function will be executed on the next interval
     * the time is 24 hr time
     * precision is of a minute
     * 
     * @param {*} executeNow execute the function on the 'start()' call, default value is false
     */
    start(executeNow = false) {
        if (executeNow) {
            this.#func();
        }

        //-------------------------------------------
        // creates the interval

        // update the time
        this.#updateTime();

        // calculate the next interval
        this.#calcNextIntervalTime();

        // calculate the time remaining util the next interval
        this.#getMsUntilIntervalTime();

        // wait until the interval time
        this.#createTimeout();
    }

    /**
     * stops the current running interval
     */
    stop() {
        // cancel the timeout
        clearTimeout(this.#timeoutID);

        // clear private vars
        this.#currentTime = 0;
        this.#currentMs = 0;
        this.#currentInterval = 0;
        this.#timeoutID = undefined;

        // clear timimg vars
        this.#timeRemaining = 0;
        //this.#isNow = false;
        //this.#overshoot = false;
        //this.#undershoot = false;

        // timeout vars
        this.#timeoutEnd = 0;
    }
}