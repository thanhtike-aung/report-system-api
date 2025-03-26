import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

/**
 *
 * @param isoString
 * @param timeZone
 * @returns
 */
export function minutesDifferFrom(
  isoString: string,
  fromTime: number,
  timeZone?: string,
): number {
  const localTime = timeZone
    ? dayjs.utc(isoString).tz(timeZone)
    : dayjs.utc(isoString).local();

  const eightAM = localTime.startOf("day").hour(fromTime).minute(0);

  return localTime.diff(eightAM, "minute");
}
