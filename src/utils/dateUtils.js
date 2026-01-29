/**
 * Date utility functions for LifeSync
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date string
 */
export const getTodayStr = () => new Date().toLocaleDateString('en-CA');

/**
 * Generate array of date strings between two dates (inclusive)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string[]} Array of date strings in YYYY-MM-DD format
 */
export const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);

    while (curr <= end) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
    }
    return dates;
};

/**
 * Get date range based on range type
 * @param {'current-week' | 'prev-week' | 'month' | 'year'} rangeType - Type of date range
 * @returns {string[]} Array of date strings
 */
export const getRangeDates = (rangeType) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

    // Calculate Monday of Current Week
    // If today is Sunday (0), Monday was 6 days ago. Otherwise it was day-1 days ago.
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - daysSinceMonday);
    currentWeekMonday.setHours(0, 0, 0, 0);

    if (rangeType === 'current-week') {
        const sunday = new Date(currentWeekMonday);
        sunday.setDate(currentWeekMonday.getDate() + 6);
        return getDatesInRange(currentWeekMonday, sunday);
    }

    if (rangeType === 'prev-week') {
        const prevMonday = new Date(currentWeekMonday);
        prevMonday.setDate(currentWeekMonday.getDate() - 7);
        const prevSunday = new Date(prevMonday);
        prevSunday.setDate(prevMonday.getDate() + 6);
        return getDatesInRange(prevMonday, prevSunday);
    }

    if (rangeType === 'month') {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        return getDatesInRange(firstDay, lastDay);
    }

    if (rangeType === 'year') {
        const firstDay = new Date(currentYear, 0, 1);
        const lastDay = new Date(currentYear, 11, 31);
        return getDatesInRange(firstDay, lastDay);
    }

    return [];
};
