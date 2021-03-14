module.exports = { createTimeout };

/**
 * calls timeout until the time has been reached
 * 
 * @param {*} callback 
 * @param {*} end
 */
 function customTimeout(callback, end) {
    setTimeout(() => {
        if (end > Date.now()) {
            customTimeout(callback, end);
        }
        else {
            callback();
        }
    }, (end - Date.now()) >> 1);
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