export const getTimezoneByUid = (uid: string): number => {
  const uidPrefixToTimezone: Record<string, number> = {
    1: 8, // CN Celestia
    2: 8, // CN Celestia
    3: 8, // CN Celestia
    5: 8, // CN Irminsul
    8: 8, // Asia
    18: 8, // Asia
    9: 8, // TW, HK, MO
    6: -5, // America
    7: 1, // Europe
  }

  for (const [prefix, tz] of Object.entries(uidPrefixToTimezone)) {
    if (uid.startsWith(prefix)) {
      return tz
    }
  }

  throw new Error(`Unknown UID prefix for timezone: ${uid}`)
}
