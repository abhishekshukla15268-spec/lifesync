import { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, PieChart, Filter, Clock } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { Card } from './ui';
import { getTodayStr, getRangeDates } from '../utils/dateUtils';

/**
 * CategorySpecific component - Analytics view with category and activity performance
 */
export const CategorySpecific = ({ categories, activities, logs }) => {
    const [selectedCatId, setSelectedCatId] = useState('all');
    const [timeRange, setTimeRange] = useState('current-week');
    const [analysisRange, setAnalysisRange] = useState('current-week');

    const timeRanges = [
        { id: 'current-week', label: 'Current Week' },
        { id: 'prev-week', label: 'Previous Week' },
        { id: 'month', label: 'Month' },
        { id: 'year', label: 'Year' },
    ];

    const today = getTodayStr();

    // Calculate aggregated stats based on Time Range
    const categoryPerformance = useMemo(() => {
        const datesToAnalyze = getRangeDates(timeRange);

        return categories.map((cat) => {
            const catActs = activities.filter((a) => String(a.categoryId) === String(cat.id));
            let total = 0;

            const validDates = datesToAnalyze.filter((d) => d <= today);
            const validPossible = catActs.length * validDates.length;

            if (catActs.length > 0 && validDates.length > 0) {
                catActs.forEach((act) => {
                    validDates.forEach((d) => {
                        if (logs[d]?.includes(act.id)) total++;
                    });
                });
            }

            const youVal = validPossible ? Math.round((total / validPossible) * 100) : 0;

            const seed = cat.name.length * 10;
            const similarVal = 60 + (seed % 30);
            const popVal = 40 + (seed % 30);

            return {
                name: cat.name,
                You: youVal,
                Similar: similarVal,
                Population: popVal,
            };
        });
    }, [timeRange, categories, activities, logs, today]);

    // Calculate detailed per-activity stats based on Analysis Range
    const catStats = useMemo(() => {
        return activities
            .filter((act) => selectedCatId === 'all' || String(act.categoryId) === String(selectedCatId))
            .map((act) => {
                let rate = 0;
                let chartData = [];
                const rangeDates = getRangeDates(analysisRange);
                const validDates = rangeDates.filter((d) => d <= today);

                const completions = validDates.reduce(
                    (acc, date) => acc + (logs[date]?.includes(act.id) ? 1 : 0),
                    0
                );
                rate = validDates.length > 0 ? Math.round((completions / validDates.length) * 100) : 0;

                if (analysisRange === 'year') {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthlyData = new Array(12).fill(0).map(() => ({ total: 0, count: 0 }));

                    rangeDates.forEach((date) => {
                        const monthIndex = parseInt(date.split('-')[1], 10) - 1;
                        if (date <= today) {
                            monthlyData[monthIndex].count++;
                            if (logs[date]?.includes(act.id)) monthlyData[monthIndex].total++;
                        }
                    });

                    chartData = months.map((m, i) => {
                        const data = monthlyData[i];
                        const percentage = data.count > 0 ? Math.round((data.total / data.count) * 100) : 0;
                        const seed = (String(act.id).charCodeAt(0) || 0) + i;
                        return {
                            day: m,
                            You: percentage,
                            Similar: 60 + (seed % 30),
                            Population: 40 + (seed % 30),
                        };
                    });
                } else {
                    chartData = rangeDates.map((date) => {
                        const isFuture = date > today;
                        const isDone = logs[date]?.includes(act.id);
                        const seed = (date.charCodeAt(9) || 0) + (String(act.id).charCodeAt(0) || 0);

                        let dayLabel;
                        if (analysisRange === 'month') {
                            dayLabel = parseInt(date.split('-')[2], 10);
                        } else {
                            const d = new Date(date);
                            dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                        }

                        return {
                            day: dayLabel,
                            You: isFuture ? null : isDone ? 100 : 0,
                            Similar: 50 + (seed % 40),
                            Population: 20 + (seed % 40),
                        };
                    });
                }

                return { ...act, rate, chartData };
            })
            .sort((a, b) => b.rate - a.rate);
    }, [selectedCatId, activities, logs, analysisRange, today]);

    const performingWell = catStats.filter((a) => a.rate >= 70);
    const needsAttention = catStats.filter((a) => a.rate < 70);

    return (
        <div className="space-y-6">
            {/* Category Balance Chart */}
            <Card className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <PieChart size={20} className="text-indigo-500" /> Category Balance
                    </h3>
                    <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                        {timeRanges.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${timeRange === range.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                unit="%"
                                domain={[0, 100]}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="You" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="Similar" name="Similar Lifestyle" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="Population" name="General Population" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Category Analysis Header with Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Category Analysis</h2>

                <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <Filter size={16} className="text-slate-500" />
                        <select
                            value={selectedCatId}
                            onChange={(e) => setSelectedCatId(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
                        {timeRanges.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setAnalysisRange(range.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${analysisRange === range.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-emerald-500">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-500" size={20} /> Performing Well
                    </h3>
                    {performingWell.length > 0 ? (
                        <div className="space-y-3">
                            {performingWell.map((act) => (
                                <div key={act.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <span className="font-medium text-emerald-900">{act.name}</span>
                                    <span className="text-sm font-bold text-emerald-600">{act.rate}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm italic">No activities above 70% consistency in this period.</p>
                    )}
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="text-amber-500" size={20} /> Needs Attention
                    </h3>
                    {needsAttention.length > 0 ? (
                        <div className="space-y-3">
                            {needsAttention.map((act) => (
                                <div key={act.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                    <span className="font-medium text-amber-900">{act.name}</span>
                                    <span className="text-sm font-bold text-amber-600">{act.rate}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm italic">Great job! All activities are on track.</p>
                    )}
                </Card>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Activity Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catStats.map((act) => {
                    return (
                        <Card key={act.id} className="relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-800">{act.name}</h4>
                                    {act.type === 'time-bound' && act.time && (
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Clock size={10} /> {act.time}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded font-medium ${act.rate >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}
                                >
                                    {act.rate}% Avg
                                </span>
                            </div>

                            <div className="h-56 w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={act.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b' }}
                                            interval={analysisRange === 'month' ? 3 : 0}
                                        />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            }}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Line
                                            name="You"
                                            type={analysisRange === 'year' ? 'monotone' : 'step'}
                                            dataKey="You"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={analysisRange !== 'month' && analysisRange !== 'year' ? { r: 3, fill: '#6366f1' } : false}
                                            activeDot={{ r: 5 }}
                                        />
                                        <Line
                                            name="Similar"
                                            type="monotone"
                                            dataKey="Similar"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                        />
                                        <Line
                                            name="Population"
                                            type="monotone"
                                            dataKey="Population"
                                            stroke="#94a3b8"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySpecific;
