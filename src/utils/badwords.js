import eeee from 'badwords.js/array.js';
let arr = eeee;
export default class {
    setOptions(options = {
        censor: '*',
        blacklist: arr,
        whitelist: []
    }) {
        if(!options.blacklist) options.blacklist = arr;
        this.options = options;
        arr = arr.filter((item) => {
            return !this.options.whitelist.includes(item);
        })
        return this;
    }
    /**
     * Returns whether or not a string contains profane
     * language.
     *
     * @param {string} str - Text to check.
     * @returns {boolean} Whether or not it is profane.
     */
    isProfane(str) {
        const string = str.trim().split(/ +/g);
        for (let i = 0; i < string.length; i++) {
            if (arr.includes(string[i])) return true;
        }
        return false;
    }
    /**
     * Clears a string off profane language.
     *
     * @param {string} str - Text to clean.
     * @returns {string} Cleaned string.
     */
    clear(str) {
        const r = str;
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