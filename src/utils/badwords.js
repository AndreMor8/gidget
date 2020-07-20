let arr = require('badwords.js/array');

class Main {
    setOptions(options = {
        censor: '*',
        blacklist: arr,
        whitelist: []
    }) {
        this.options = options;
        arr = arr.filter((item, index, arr) => {
            return !whitelist.includes(item);
        })
        return this;
    }
    /**
     * Returns whether or not a string contains profane
     * language
     *
     * @param {string} str
     * @returns {Boolean} whether or not it is profane
     */
    isProfane(str) {
        let string = str.trim().split(/ +/g);
        for (let i = 0; i < string.length; i++) {
            if (arr.includes(string[i])) return true;
        }
        return false;
    }
    /**
     * Clears a string off profane language
     *
     * @param {string} str
     * @returns {Boolean}
     */
    clear(str) {
        let r = str;
        for (let i = 0; i < arr.length; i++) {
            let s = "";
            for (let j = 0; j <= arr[i].length; i++) {
                s += "*";
            }
            r.replace(arr[i], s);
        }
        return r;
    }

}

module.exports = Main;