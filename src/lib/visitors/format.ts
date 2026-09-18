/**
 * Turning visitor figures into something a person would say out loud.
 *
 * Kept out of the component because it is arithmetic, not markup: the unit
 * carries and the rounding edges are exactly the kind of thing worth a test,
 * and a helper exported from a "use client" file cannot easily have one.
 */

/**
 * Minutes, in whichever unit is worth reading at that magnitude.
 *
 * The precision that helps changes with the size of the number: minutes matter
 * for a visit, and nobody reads "95h 54m" as "about four days" without doing
 * the arithmetic themselves.
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return "Under a minute";
  if (minutes < 60) return `${Math.round(minutes)} min`;

  if (minutes < 48 * 60) {
    let hours = Math.floor(minutes / 60);
    let rest = Math.round(minutes % 60);
    // A rounded remainder can land on a whole unit and has to carry, or the
    // panel prints "1h 60m".
    if (rest >= 60) {
      hours += 1;
      rest = 0;
    }
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  let days = Math.floor(minutes / 1440);
  let hours = Math.round((minutes % 1440) / 60);
  // Same carry, one unit up: this read "3d 24h" against real traffic.
  if (hours >= 24) {
    days += 1;
    hours = 0;
  }
  return hours ? `${days}d ${hours}h` : `${days} days`;
}
