// ============================================
//  DATE HELPER — utils/dateHelper.js
// ============================================
//
//  WHAT WAS THE BUG?
//  Before, we used: new Date().toISOString().slice(0, 10)
//  toISOString() returns the date in UTC (London time).
//
//  Example of the problem:
//    - It's 11:30 PM IST on April 2nd
//    - In UTC, that's 6:00 PM on April 2nd... but wait,
//      IST is UTC+5:30, so 11:30 PM IST = 6:00 PM UTC
//    - Actually, the real problem is when it's past midnight UTC:
//      11:30 PM IST (April 2) = 6:00 PM UTC (April 2) — OK here
//      But 1:00 AM IST (April 3) = 7:30 PM UTC (April 2) — WRONG!
//      Actually no, 1:00 AM IST = 7:30 PM UTC previous day? No...
//
//  Let me be precise:
//    IST = UTC + 5:30
//    So midnight IST (April 3) = 6:30 PM UTC (April 2)
//    And midnight UTC (April 3) = 5:30 AM IST (April 3)
//
//  The problem: between 12:00 AM and 5:30 AM IST,
//  toISOString() still shows the PREVIOUS day in UTC.
//  So data logged at 2:00 AM IST on April 3 would be
//  stored as April 2 (since 2:00 AM IST = 8:30 PM UTC April 2).
//
//  THE FIX:
//  Use the LOCAL date (the date the user sees on their clock)
//  instead of the UTC date. This way, the date always matches
//  what the user expects.
// ============================================

/**
 * getTodayKey — Returns today's date as "YYYY-MM-DD" in LOCAL time.
 *
 * Uses local timezone methods instead of toISOString() (which is UTC).
 * This ensures the date matches the user's clock.
 *
 * @returns {string} Date in "YYYY-MM-DD" format (local timezone)
 */
function getTodayKey() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')  // getMonth() is 0-indexed
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * getYesterdayKey — Returns yesterday's date as "YYYY-MM-DD" in LOCAL time.
 *
 * @returns {string} Yesterday's date in "YYYY-MM-DD" format
 */
function getYesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

module.exports = { getTodayKey, getYesterdayKey }
