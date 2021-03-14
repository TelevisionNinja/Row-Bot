module.exports = { createTimeout };

/**
 * calls timeout until the time has been reached
 * 
 * @param {*} callback 
 * @param {*} finalTime
 */
function customTimeout(callback, finalTime) {
    setTimeout(() => {
        if (finalTime > Date.now()) {
            customTimeout(callback, finalTime);
        }
        else {
            callback();
        }
    }, (finalTime - Date.now()) >> 1);
}

/**
 * creates a timeout
 * this tries to reduce drift
 * 
 * @param {*} callback 
 * @param {*} time 
 */
function createTimeout(callback, time) {
    customTimeout(callback, time + Date.now());
}