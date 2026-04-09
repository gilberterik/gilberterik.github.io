// data.js — Edit this file to update your calendar.
//
// Each entry in PERIODS has:
//   start:    "YYYY-MM-DD"  (inclusive)
//   end:      "YYYY-MM-DD"  (inclusive)
//   status:   "texas" | "florida"
//   label:    optional short note shown in the tooltip (e.g. destination)
//   location: optional location for ICS events — defaults to TEXAS_CITY when
//             status is "texas", or FLORIDA_CITY when status is "florida"
//
// Rules:
//   - Periods should not overlap.
//   - Any day not covered by a period shows as "unknown" (gray).
//   - The calendar displays from the first period's month to the last.

export const OWNER_NAME   = "Erik";
export const TEXAS_CITY   = "Austin";
export const FLORIDA_CITY = "Florida";

export const PERIODS = [
  // Apr 2: 5:15am departure AUS → counts as first Miami day (not a Austin workday)
  { start: "2026-04-01", end: "2026-04-01", status: "texas" },
  { start: "2026-04-02", end: "2026-04-07", status: "florida", label: "Miami", location: "Miami" },
  // Apr 7: lands MIA→AUS at 1:07am → Apr 8 is first full Austin workday
  { start: "2026-04-08", end: "2026-04-15", status: "texas" },
  // Apr 16: 4:12pm departure AUS → counts as Austin workday; arrives MIA evening → Apr 17 first Miami workday
  { start: "2026-04-16", end: "2026-04-16", status: "texas" },
  { start: "2026-04-17", end: "2026-04-27", status: "florida", label: "Miami", location: "Miami" },
  // Apr 27: lands MIA→AUS at 9:04pm → Apr 28 is first full Austin workday
  { start: "2026-04-28", end: "2026-04-29", status: "texas" },
  // Apr 30: 4:12pm departure AUS → counts as Austin workday; arrives MIA evening → May 1 first Miami workday
  { start: "2026-04-30", end: "2026-04-30", status: "texas" },
  { start: "2026-05-01", end: "2026-05-04", status: "florida", label: "Miami", location: "Miami" },
  // May 4: lands MIA→AUS at 11:59pm → May 5 is first full Austin workday
  { start: "2026-05-05", end: "2026-05-19", status: "texas" },
  // May 20: 4:12pm departure AUS → counts as Austin workday; arrives MIA evening → May 21 first Miami workday
  { start: "2026-05-20", end: "2026-05-20", status: "texas" },
  { start: "2026-05-21", end: "2026-05-26", status: "florida", label: "Miami", location: "Miami" },
  // May 26: lands MIA→AUS at 11:59pm → May 27 is first full Austin workday
  { start: "2026-05-27", end: "2026-05-31", status: "texas" },
];
