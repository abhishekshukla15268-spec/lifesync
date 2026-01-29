/**
 * Initial categories for LifeSync
 */
export const INITIAL_CATEGORIES = [
    { id: 'cat1', name: 'Health & Fitness', color: '#10b981' },
    { id: 'cat2', name: 'Productivity', color: '#3b82f6' },
    { id: 'cat3', name: 'Mindfulness', color: '#8b5cf6' },
    { id: 'cat4', name: 'Social', color: '#f59e0b' },
];

/**
 * Initial activities for LifeSync
 */
export const INITIAL_ACTIVITIES = [
    { id: 'act1', name: 'Morning Jog (30m)', categoryId: 'cat1', type: 'time-bound', time: '06:30' },
    { id: 'act2', name: 'Drink 3L Water', categoryId: 'cat1', type: 'free', time: '' },
    { id: 'act3', name: 'Read 20 Pages', categoryId: 'cat2', type: 'free', time: '' },
    { id: 'act4', name: 'Deep Work (2h)', categoryId: 'cat2', type: 'time-bound', time: '10:00' },
    { id: 'act5', name: 'Meditation (10m)', categoryId: 'cat3', type: 'time-bound', time: '22:00' },
    { id: 'act6', name: 'Call Family', categoryId: 'cat4', type: 'free', time: '' },
];

/**
 * Generate mock activity logs for the entire current year up to today
 * @returns {Object} Object with date strings as keys and arrays of activity IDs as values
 */
export const generateMockLogs = () => {
    const logs = {};
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const tempDate = new Date(startOfYear);

    while (tempDate <= today) {
        const dateStr = tempDate.toISOString().split('T')[0];
        // Randomly assign completed activities (60% chance)
        logs[dateStr] = INITIAL_ACTIVITIES.filter(() => Math.random() > 0.4).map((a) => a.id);
        tempDate.setDate(tempDate.getDate() + 1);
    }
    return logs;
};
