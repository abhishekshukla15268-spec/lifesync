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

/**
 * Convert time string (HH:MM) to minutes from 8am start
 * Times from 08:00 to 23:59 are 0-959 minutes
 * Times from 00:00 to 07:59 are 960-1439 minutes (next day)
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes from 8am (0-1439)
 */
export const timeToMinutesFrom8am = (time) => {
    if (!time) return 9999; // No time = end of list
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const eightAM = 8 * 60; // 480 minutes

    if (totalMinutes >= eightAM) {
        return totalMinutes - eightAM; // 8am = 0, 9am = 60, etc.
    } else {
        return totalMinutes + (24 * 60 - eightAM); // 12am = 960, 7am = 1380
    }
};

/**
 * Sort activities by their scheduled time (8am to 8am next day)
 * Time-bound activities are sorted first, then free activities
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Sorted activities
 */
export const sortActivitiesByTime = (activities) => {
    return [...activities].sort((a, b) => {
        const aTime = a.type === 'time-bound' && a.time ? timeToMinutesFrom8am(a.time) : 9999;
        const bTime = b.type === 'time-bound' && b.time ? timeToMinutesFrom8am(b.time) : 9999;

        if (aTime !== bTime) return aTime - bTime;

        // If same time or both free, sort by name
        return a.name.localeCompare(b.name);
    });
};

/**
 * Group activities by time period for display
 * @param {Array} activities - Sorted activities
 * @returns {Array} Array of time period groups
 */
export const groupActivitiesByTimePeriod = (activities) => {
    const periods = [
        { id: 'morning', label: 'Morning (8am - 12pm)', start: 0, end: 240 },
        { id: 'afternoon', label: 'Afternoon (12pm - 5pm)', start: 240, end: 540 },
        { id: 'evening', label: 'Evening (5pm - 9pm)', start: 540, end: 780 },
        { id: 'night', label: 'Night (9pm - 12am)', start: 780, end: 960 },
        { id: 'late-night', label: 'Late Night (12am - 8am)', start: 960, end: 1440 },
        { id: 'anytime', label: 'Anytime', start: 9999, end: 9999 },
    ];

    return periods.map(period => ({
        ...period,
        activities: activities.filter(act => {
            const time = act.type === 'time-bound' && act.time ? timeToMinutesFrom8am(act.time) : 9999;
            if (period.id === 'anytime') return time === 9999;
            return time >= period.start && time < period.end;
        })
    })).filter(group => group.activities.length > 0);
};

