let queues = new Map();

export default {
    /**
     * get the queue of a guild
     * do not manipulate the returned array, use the functions instead
     * 
     * @param {*} guildID 
     * @returns 
     */
    get(guildID) {
        const result = queues.get(guildID);

        if (typeof result === 'undefined') {
            return [];
        }

        return result;
    },

    /**
     * get the current playing song (front of the queue)
     * 
     * @param {*} guildID 
     * @returns 
     */
    getCurrentSong(guildID) {
        const result = queues.get(guildID);

        if (typeof result === 'undefined') {
            return '';
        }

        return result[0];
    },

    /**
     * push a song to the back of the queue
     * 
     * @param {*} guildID 
     * @param {*} url 
     */
    push(guildID, url) {
        let result = queues.get(guildID);

        if (typeof result === 'undefined') {
            queues.set(guildID, [url]);
        }
        else {
            result.push(url);
            //queues.set(guildID, result);
        }
    },

    /**
     * remove the current song in a queue
     * 
     * @param {*} guildID 
     * @returns true if there are songs in the queue, false if there are no more songs
     */
    pop(guildID) {
        let result = queues.get(guildID);

        if (typeof result === 'undefined') {
            return false;
        }

        result.shift();

        if (result.length) {
            //queues.set(guildID, result);
            return true;
        }

        queues.delete(guildID);
        return false;
    },

    /**
     * clear the queue of a guild
     * 
     * @param {*} guildID 
     * @returns 
     */
    clear(guildID) {
        let result = queues.get(guildID);

        if (typeof result === 'undefined') {
            return;
        }

        if (result.length > 1) {
            // delete everything after the first element
            result.splice(1);
            //queues.set(guildID, [result[0]]);
        }
    },

    /**
     * remove a song at an index in a queue
     * 
     * @param {*} guildID 
     * @param {*} index index of song to remove
     * @returns true if there are songs in the queue, false if there are no more songs or the index is invalid
     */
    popIndex(guildID, index) {
        let result = queues.get(guildID);

        if (typeof result === 'undefined' || index <= 0 || index >= result.length || result.length === 1) {
            return false;
        }

        // delete the element at the index
        result.splice(index, 1);

        if (result.length) {
            //queues.set(guildID, result);
            return true;
        }

        queues.delete(guildID);
        return false;
    },

    /**
     * delete the queue of a guild
     * 
     * @param {*} guildID 
     */
    deleteQueue(guildID) {
        queues.delete(guildID);
    },

    /**
     * jump to an index in a queue
     * 
     * @param {*} guildID 
     * @param {*} index 
     * @returns true if the queue was jumped, false if not
     */
    jump(guildID, index) {
        let result = queues.get(guildID);

        if (typeof result === 'undefined') {
            return false;
        }

        if (index < 0 || index >= result.length || result.length === 1) {
            return false;
        }

        // delete everything before index
        result.splice(0, index);

        if (result.length) {
            //queues.set(guildID, result);
            return true;
        }

        queues.delete(guildID);
        return false;
    }
}
