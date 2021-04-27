/**
 * back off using axios and p-queue
 * 
 * @param {*} error 
 * @param {*} queue 
 * @returns true if backed off, false if not
 */
export function backOff(error, queue) {
    const errorCode = error.response.status;

    if ((errorCode === 429 || errorCode >= 500) && !queue.isPaused) {
        queue.pause();

        const retryTime = error.response.headers['retry-after'];
        let time = 1;

        if (typeof retryTime !== 'undefined') {
            const parsedNum = parseInt(retryTime);

            if (parsedNum) {
                time = parsedNum * 1000;
            }
            else {
                time = (new Date(retryTime).getTime() - Date.now()) || 1000;
            }
        }

        setTimeout(() => {
            queue.clear();
            queue.start();
        }, time);

        return true;
    }

    return false;
}