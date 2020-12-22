const axios = require('axios');
const crypto = require('crypto');

module.exports = {
    randomMath,
    randomCrypto,
    randomTrue,
    randomTrueArray
}

/* inclusive min
    exclusive max
*/
function randomMath(min = 0, max = 0) {
    if (max === min) {
        return max;
    }
    
    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return Math.floor(Math.random() * (max - min)) + min;
}

/* inclusive min
    exclusive max
*/
function randomCrypto(min = 0, max = 0) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return crypto.randomInt(min, max);
}

/* inclusive min
    exclusive max
    base 10
*/
async function randomTrue(min = 0, max = 0) {
    if (max === min) {
        return max;
    }
    
    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    max--;

    const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
    
    try {
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }

    return 0;
}

/* inclusive min
    exclusive max
*/
async function randomTrueArray(min = 0, max = 0, amount = 1, base = 10) {
    let arr = [];
    arr.length = amount;

    if (max === min) {
        arr.fill(max);
        return arr;
    }
    
    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    max--;

    const url = `https://www.random.org/integers/?num=${amount}&min=${min}&max=${max}&col=1&base=${base}&format=plain&rnd=new`;
    
    try {
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }

    arr.fill(0);
    return arr;
}