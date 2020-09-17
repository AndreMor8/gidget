const ms = require("millisecond");
const toMilliseconds = require('@sindresorhus/to-milliseconds');
module.exports = function(time = "0:00") {
    const arr = time.split(":")
    if(arr.some(s => !isNaN(s))) {
        const final = arr.reverse();
        return toMilliseconds({
            seconds: final[0],
            minutes: final[1],
            hours: final[2],
            days: final[3]
        })
    } else {
        return ms(time);
    }
}