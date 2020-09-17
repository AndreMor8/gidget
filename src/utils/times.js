const ms = require("millisecond");
const toMilliseconds = require('@sindresorhus/to-milliseconds');
module.exports = function(time = "0:00") {
    const arr = time.split(":")
    if(arr.some(s => !isNaN(s))) {
        const final = arr.reverse();
        return toMilliseconds({
            seconds: parseInt(final[0]) || undefined,
            minutes: parseInt(final[1]) || undefined,
            hours: parseInt(final[2]) || undefined,
            days: parseInt(final[3]) || undefined
        })
    } else {
        return ms(time);
    }
}