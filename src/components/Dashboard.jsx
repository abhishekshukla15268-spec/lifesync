import React, { useMemo } from 'react';
import {
    Activity,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Save,
    Users,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card } from './ui';
import { getTodayStr, getRangeDates } from '../utils/dateUtils';

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
    const today = getTodayStr();

    // Calculate stats for dashboard
    const stats = useMemo(() => {
        const currentWeekDates = getRangeDates('current-week');
        let totalCompleted = 0;
        const validDates = currentWeekDates.filter((d) => d <= today);
        let totalPossible = validDates.length * activities.length;

        validDates.forEach((date) => {
            if (logs[date]) {
                totalCompleted += logs[date].length;
            }
        });

        const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

        const comparisonData = [
            {
                name: 'Completion Rate',
                You: completionRate,
                'Similar Lifestyle': Math.min(100, completionRate + 5),
                'General Population': Math.max(0, completionRate - 15),
            },
            {
                name: 'Avg Activities/Day',
                You: Math.round(totalCompleted / (validDates.length || 1)),
                'Similar Lifestyle': Math.round(totalCompleted / (validDates.length || 1)) + 1,
                'General Population': Math.max(0, Math.round(totalCompleted / (validDates.length || 1)) - 2),
            },
        ];

        return { completionRate, comparisonData };
    }, [logs, activities, today]);

    const toggleActivityTemp = (activityId) => {
        setTempTodayLogs((prev) =>
            prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Weekly Consistency</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.completionRate}%</h3>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight size={12} className="mr-1" /> Mon - Sun
                        </p>
                    </div>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Users size={18} /> Lifestyle Comparison
                        </h3>
                        <div className="flex gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> You
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Similar Lifestyle
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Population
                            </div>
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.comparisonData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="You" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="Similar Lifestyle" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="General Population" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Activity Grid */}
            <Card className="overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Daily Activity Log</h3>
                        <p className="text-sm text-slate-500">Current Week (Mon - Sun)</p>
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
                                {categories.map((cat) => {
                                    const catActivities = activities.filter((a) => a.categoryId === cat.id);
                                    if (catActivities.length === 0) return null;

                                    return (
                                        <React.Fragment key={cat.id}>
                                            <tr className="bg-slate-50/80">
                                                <td
                                                    colSpan={dates.length + 1}
                                                    className="py-2 px-4 text-xs font-bold uppercase tracking-wider"
                                                    style={{ color: cat.color }}
                                                >
                                                    {cat.name}
                                                </td>
                                            </tr>
                                            {catActivities.map((act) => (
                                                <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 px-4 text-sm font-medium text-slate-700 pl-8 border-l-4 border-transparent hover:border-indigo-100">
                                                        <div className="flex flex-col">
                                                            <span>{act.name}</span>
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
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
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

                        <div className="space-y-8">
                            {categories.map((cat) => {
                                const catActivities = activities.filter((a) => a.categoryId === cat.id);
                                if (catActivities.length === 0) return null;

                                return (
                                    <div key={cat.id}>
                                        <h5
                                            className="font-bold text-sm uppercase tracking-wide mb-3 pl-1"
                                            style={{ color: cat.color }}
                                        >
                                            {cat.name}
                                        </h5>
                                        <div className="space-y-3">
                                            {catActivities.map((act) => {
                                                const isSelected = tempTodayLogs.includes(act.id);
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
                                                                <p className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                                    {act.name}
                                                                </p>
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
                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;
