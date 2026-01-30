import React, { useMemo } from 'react';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    Save,
    Flame,
    Sunrise,
    Sun,
    Sunset,
    Moon,
    ArrowRight,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { Card } from './ui';
import { getTodayStr, getRangeDates, groupActivitiesByTimePeriod, sortActivitiesByTime } from '../utils/dateUtils';

/**
 * Dashboard component - Main overview with weekly activity grid
 */
export const Dashboard = ({
    categories,
    activities,
    logs,
    gridMode,
    setGridMode,
    tempTodayLogs,
    setTempTodayLogs,
    handleSaveDay,
}) => {
    const dates = getRangeDates('current-week');
    const prevWeekDates = getRangeDates('prev-week');
    const today = getTodayStr();

    // Sort activities by time
    const sortedActivities = useMemo(() => sortActivitiesByTime(activities), [activities]);

    // Group activities by time period
    const timePeriods = useMemo(() => groupActivitiesByTimePeriod(sortedActivities), [sortedActivities]);

    // Period icons
    const periodIcons = {
        'morning': <Sunrise size={14} className="text-amber-500" />,
        'afternoon': <Sun size={14} className="text-yellow-500" />,
        'evening': <Sunset size={14} className="text-orange-500" />,
        'night': <Moon size={14} className="text-indigo-500" />,
        'late-night': <Moon size={14} className="text-slate-500" />,
        'anytime': <Clock size={14} className="text-slate-400" />,
    };

    // Calculate stats for dashboard - This Week vs Last Week
    const stats = useMemo(() => {
        // Current week
        const validDates = dates.filter((d) => d <= today);
        let thisWeekCompleted = 0;
        let thisWeekPossible = validDates.length * activities.length;

        validDates.forEach((date) => {
            if (logs[date]) {
                thisWeekCompleted += logs[date].length;
            }
        });

        // Previous week (full week)
        let lastWeekCompleted = 0;
        let lastWeekPossible = prevWeekDates.length * activities.length;

        prevWeekDates.forEach((date) => {
            if (logs[date]) {
                lastWeekCompleted += logs[date].length;
            }
        });

        const thisWeekRate = thisWeekPossible > 0 ? Math.round((thisWeekCompleted / thisWeekPossible) * 100) : 0;
        const lastWeekRate = lastWeekPossible > 0 ? Math.round((lastWeekCompleted / lastWeekPossible) * 100) : 0;
        const trend = thisWeekRate - lastWeekRate;

        // Daily trend data for line chart
        const dailyData = dates.map((date, idx) => {
            const dayCompleted = logs[date]?.length || 0;
            const prevDate = prevWeekDates[idx];
            const prevDayCompleted = logs[prevDate]?.length || 0;

            return {
                day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                'This Week': date <= today ? dayCompleted : null,
                'Last Week': prevDayCompleted,
            };
        });

        return { thisWeekRate, lastWeekRate, trend, dailyData, thisWeekCompleted, validDaysCount: validDates.length };
    }, [logs, activities, dates, prevWeekDates, today]);

    // Calculate streaks for activities
    const streaks = useMemo(() => {
        const activityStreaks = activities.map(act => {
            let streak = 0;
            let checkDate = new Date(today);

            // Count backwards from today
            while (true) {
                const dateStr = checkDate.toLocaleDateString('en-CA');
                if (logs[dateStr]?.includes(act.id)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }

            const cat = categories.find(c => String(c.id) === String(act.categoryId));
            return {
                ...act,
                streak,
                categoryName: cat?.name || 'Unknown',
                categoryColor: cat?.color || '#6366f1',
            };
        });

        // Return top 5 by streak count
        return activityStreaks
            .filter(a => a.streak > 0)
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 5);
    }, [activities, logs, today, categories]);

    // Get next scheduled activity
    const nextActivity = useMemo(() => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const scheduled = sortedActivities
            .filter(act => act.type === 'time-bound' && act.time)
            .map(act => {
                const [h, m] = act.time.split(':').map(Number);
                const actMinutes = h * 60 + m;
                return { ...act, minutes: actMinutes };
            })
            .filter(act => act.minutes > currentMinutes)
            .sort((a, b) => a.minutes - b.minutes);

        return scheduled[0] || null;
    }, [sortedActivities]);

    const toggleActivityTemp = (activityId) => {
        setTempTodayLogs((prev) =>
            prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
        );
    };

    // Get category info for an activity
    const getCategoryForActivity = (act) => {
        return categories.find((c) => String(c.id) === String(act.categoryId));
    };

    return (
        <div className="space-y-6">
            {/* Top Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weekly Consistency Card */}
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">This Week</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.thisWeekRate}%</h3>
                        <p className={`text-xs flex items-center mt-1 ${stats.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {stats.trend >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                            {stats.trend >= 0 ? '+' : ''}{stats.trend}% vs last week
                        </p>
                    </div>
                </Card>

                {/* Streak Card */}
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                        <Flame size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Top Streak</p>
                        {streaks.length > 0 ? (
                            <>
                                <h3 className="text-2xl font-bold text-slate-800">{streaks[0].streak} days</h3>
                                <p className="text-xs text-slate-500 truncate max-w-[150px]">{streaks[0].name}</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-slate-400">0 days</h3>
                                <p className="text-xs text-slate-400">Complete activities daily!</p>
                            </>
                        )}
                    </div>
                </Card>

                {/* Next Up Card */}
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <ArrowRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Next Up</p>
                        {nextActivity ? (
                            <>
                                <h3 className="text-lg font-bold text-slate-800 truncate max-w-[180px]">{nextActivity.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock size={10} /> {nextActivity.time}
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-slate-400">No more today</h3>
                                <p className="text-xs text-slate-400">All scheduled done!</p>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Week Comparison Chart */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" /> This Week vs Last Week
                    </h3>
                    <div className="flex gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> This Week
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Last Week
                        </div>
                    </div>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="Last Week"
                                stroke="#cbd5e1"
                                strokeWidth={2}
                                dot={{ fill: '#cbd5e1', r: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="This Week"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', r: 4 }}
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Streak Leaderboard */}
            {streaks.length > 0 && (
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Flame size={18} className="text-orange-500" /> Active Streaks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {streaks.map((act, idx) => (
                            <div
                                key={act.id}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                            >
                                <div
                                    className="text-2xl font-bold"
                                    style={{ color: idx === 0 ? '#f97316' : idx === 1 ? '#6366f1' : '#94a3b8' }}
                                >
                                    {act.streak}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{act.name}</p>
                                    <p className="text-[10px] text-slate-400">{act.streak} day{act.streak > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Activity Grid */}
            <Card className="overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Daily Activity Log</h3>
                        <p className="text-sm text-slate-500">Sorted by time (8am → 8am)</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setGridMode('overview')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${gridMode === 'overview'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => {
                                setTempTodayLogs(logs[today] || []);
                                setGridMode('edit');
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${gridMode === 'edit'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Log Today
                        </button>
                    </div>
                </div>

                {gridMode === 'overview' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Activity
                                    </th>
                                    {dates.map((date) => (
                                        <th key={date} className="text-center py-3 px-2 text-xs font-semibold text-slate-500">
                                            {new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                                            <br />
                                            <span className={`text-[10px] ${date === today ? 'text-indigo-600 font-bold' : ''}`}>
                                                {date.slice(8)}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {timePeriods.map((period) => (
                                    <React.Fragment key={period.id}>
                                        <tr className="bg-slate-50/80">
                                            <td
                                                colSpan={dates.length + 1}
                                                className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-600"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {periodIcons[period.id]}
                                                    {period.label}
                                                </span>
                                            </td>
                                        </tr>
                                        {period.activities.map((act) => {
                                            const cat = getCategoryForActivity(act);
                                            return (
                                                <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 px-4 text-sm font-medium text-slate-700 pl-8">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span>{act.name}</span>
                                                                {cat && (
                                                                    <span
                                                                        className="w-2 h-2 rounded-full"
                                                                        style={{ backgroundColor: cat.color }}
                                                                        title={cat.name}
                                                                    />
                                                                )}
                                                            </div>
                                                            {act.type === 'time-bound' && act.time && (
                                                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                    <Clock size={10} /> {act.time}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {dates.map((date) => {
                                                        const isFuture = date > today;
                                                        const isDone = logs[date]?.includes(act.id);

                                                        return (
                                                            <td key={date} className="py-3 px-2 text-center">
                                                                {isFuture ? (
                                                                    <div className="mx-auto w-1 h-1 bg-slate-100 rounded-full" />
                                                                ) : isDone ? (
                                                                    <div className="mx-auto w-6 h-6 bg-indigo-100 rounded text-indigo-600 flex items-center justify-center">
                                                                        <CheckCircle2 size={14} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="mx-auto w-1 h-1 bg-slate-200 rounded-full" />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto py-4">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-semibold text-slate-700">
                                Log Activities for {new Date().toLocaleDateString()}
                            </h4>
                            <button
                                onClick={handleSaveDay}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <Save size={16} /> Save Progress
                            </button>
                        </div>

                        <div className="space-y-6">
                            {timePeriods.map((period) => (
                                <div key={period.id}>
                                    <h5 className="font-bold text-sm uppercase tracking-wide mb-3 pl-1 text-slate-600 flex items-center gap-2">
                                        {periodIcons[period.id]}
                                        {period.label}
                                    </h5>
                                    <div className="space-y-3">
                                        {period.activities.map((act) => {
                                            const isSelected = tempTodayLogs.includes(act.id);
                                            const cat = getCategoryForActivity(act);
                                            return (
                                                <div
                                                    key={act.id}
                                                    onClick={() => toggleActivityTemp(act.id)}
                                                    className={`group cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected
                                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                                                                }`}
                                                        >
                                                            {isSelected && <CheckCircle2 size={14} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                    {act.name}
                                                                </p>
                                                                {cat && (
                                                                    <span
                                                                        className="text-[10px] px-1.5 py-0.5 rounded"
                                                                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                                                                    >
                                                                        {cat.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {act.type === 'time-bound' && act.time ? (
                                                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                                                        <Clock size={12} /> {act.time}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400 italic">Anytime</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;
