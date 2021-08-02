import ms from "millisecond";
import toMilliseconds from '@sindresorhus/to-milliseconds';
export default function (time = "0:00") {
  const arr = time.split(":")
  if (arr.some(s => !isNaN(s))) {
    const final = arr.reverse();
    return toMilliseconds({
      seconds: parseInt(final[0]) || 0,
      minutes: parseInt(final[1]) || 0,
      hours: parseInt(final[2]) || 0,
      days: parseInt(final[3]) || 0
    })
  } else {
    return ms(time);
  }
}