module.exports = {
    /* inclusive min
        exclusive max
    */
    randomInt(min = 0, max = 0) {
        let result = 0;

        if (max === min) {
            result = max;
        }
        else {
            if (min > max) {
                const temp = max;
                max = min;
                min = temp;
            }

            result = Math.floor(Math.random() * (max - min)) + min;
        }

        return result;
    }
}