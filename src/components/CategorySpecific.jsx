import { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, PieChart, Filter, Clock, Battery, Zap, TrendingUp, ChevronDown, ChevronRight, BarChart2, List } from 'lucide-react';
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Cell,
    PieChart as RePieChart,
    Pie,
} from 'recharts';
import { Card } from './ui';
import { OutcomeMatrix } from './OutcomeMatrix';
import { getTodayStr, getRangeDates } from '../utils/dateUtils';

// Category impact mappings for burnout calculation
const CATEGORY_ENERGY = {
    'health': 'restorative',
    'fitness': 'restorative',
    'sleep': 'restorative',
    'rest': 'restorative',
    'meditation': 'restorative',
    'mindfulness': 'restorative',
    'hobby': 'restorative',
    'social': 'neutral',
    'family': 'neutral',
    'learning': 'neutral',
    'work': 'draining',
    'productivity': 'draining',
    'finance': 'draining',
};

const getEnergyType = (categoryName) => {
    const lower = categoryName.toLowerCase();
    for (const [key, type] of Object.entries(CATEGORY_ENERGY)) {
        if (lower.includes(key)) return type;
    }
    return 'neutral';
};

/**
 * CategorySpecific component - Analytics view with outcome predictions and habit health
 */
export const CategorySpecific = ({ categories, activities, logs }) => {
    const [timeRange, setTimeRange] = useState('current-week');
    const [insightsTimeRange, setInsightsTimeRange] = useState('current-week');
    const [analyticsView, setAnalyticsView] = useState('performance'); // 'performance' or 'insights'
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [performanceViewMode, setPerformanceViewMode] = useState('list'); // 'list' or 'graph'

    const timeRanges = [
        { id: 'current-week', label: 'This Week' },
        { id: 'prev-week', label: 'Last Week' },
        { id: 'month', label: 'This Month' },
    ];

    const today = getTodayStr();

    // Calculate category performance - You vs Your Past
    const categoryPerformance = useMemo(() => {
        const currentDates = getRangeDates(timeRange);
        const prevDates = getRangeDates(timeRange === 'current-week' ? 'prev-week' : 'current-week');

        return categories.map((cat) => {
            const catActs = activities.filter((a) => String(a.categoryId) === String(cat.id));

            let currentTotal = 0;
            const currentValid = currentDates.filter((d) => d <= today);
            const currentPossible = catActs.length * currentValid.length;

            if (catActs.length > 0 && currentValid.length > 0) {
                catActs.forEach((act) => {
                    currentValid.forEach((d) => {
                        if (logs[d]?.includes(act.id)) currentTotal++;
                    });
                });
            }

            let prevTotal = 0;
            const prevValid = prevDates.filter((d) => d <= today);
            const prevPossible = catActs.length * prevValid.length;

            if (catActs.length > 0 && prevValid.length > 0) {
                catActs.forEach((act) => {
                    prevValid.forEach((d) => {
                        if (logs[d]?.includes(act.id)) prevTotal++;
                    });
                });
            }

            const currentRate = currentPossible ? Math.round((currentTotal / currentPossible) * 100) : 0;
            const prevRate = prevPossible ? Math.round((prevTotal / prevPossible) * 100) : 0;
            const trend = currentRate - prevRate;

            return {
                name: cat.name,
                color: cat.color,
                current: currentRate,
                previous: prevRate,
                trend,
                energyType: getEnergyType(cat.name),
            };
        });
    }, [timeRange, categories, activities, logs, today]);

    // Calculate Burnout Balance based on insightsTimeRange
    const burnoutBalance = useMemo(() => {
        const datesToAnalyze = getRangeDates(insightsTimeRange);
        const validDates = datesToAnalyze.filter(d => d <= today);

        let drainingHours = 0;
        let restorativeHours = 0;
        let neutralHours = 0;

        // For each day, check which activities were completed and sum their hours
        activities.forEach(act => {
            const cat = categories.find(c => String(c.id) === String(act.categoryId));
            if (!cat) return;

            const hours = act.hours || 0;
            const energyType = getEnergyType(cat.name);

            // Count how many days this activity was completed
            const completedDays = validDates.filter(d => logs[d]?.includes(act.id)).length;
            const totalHours = hours * completedDays;

            if (energyType === 'draining') drainingHours += totalHours;
            else if (energyType === 'restorative') restorativeHours += totalHours;
            else neutralHours += totalHours;
        });

        const ratio = drainingHours > 0 ? restorativeHours / drainingHours : restorativeHours > 0 ? 999 : 1;

        let status = 'balanced';
        let statusColor = '#10b981';
        if (ratio < 0.5) {
            status = 'burnout risk';
            statusColor = '#ef4444';
        } else if (ratio < 1) {
            status = 'needs attention';
            statusColor = '#f59e0b';
        }

        const pieData = [
            { name: 'Draining', value: drainingHours, color: '#ef4444' },
            { name: 'Neutral', value: neutralHours, color: '#94a3b8' },
            { name: 'Restorative', value: restorativeHours, color: '#10b981' },
        ].filter(d => d.value > 0);

        return { drainingHours, restorativeHours, neutralHours, ratio, status, statusColor, pieData };
    }, [activities, categories, logs, insightsTimeRange, today]);

    // Radar chart data for habit health (Performance view)
    const radarData = useMemo(() => {
        return categoryPerformance.map(cat => ({
            category: cat.name.length > 10 ? cat.name.slice(0, 10) + '...' : cat.name,
            score: cat.current,
            fullMark: 100,
        }));
    }, [categoryPerformance]);

    // Radar chart data for Insights view - uses insightsTimeRange
    const insightsRadarData = useMemo(() => {
        const datesToAnalyze = getRangeDates(insightsTimeRange);
        const validDates = datesToAnalyze.filter(d => d <= today);

        return categories.map(cat => {
            const catActs = activities.filter(a => String(a.categoryId) === String(cat.id));
            let completed = 0;
            const possible = catActs.length * validDates.length;

            if (catActs.length > 0 && validDates.length > 0) {
                catActs.forEach(act => {
                    validDates.forEach(d => {
                        if (logs[d]?.includes(act.id)) completed++;
                    });
                });
            }

            const score = possible > 0 ? Math.round((completed / possible) * 100) : 0;

            return {
                category: cat.name.length > 10 ? cat.name.slice(0, 10) + '...' : cat.name,
                score,
                fullMark: 100,
            };
        });
    }, [categories, activities, logs, insightsTimeRange, today]);

    // Top performers and areas to improve
    const insights = useMemo(() => {
        const sorted = [...categoryPerformance].sort((a, b) => b.current - a.current);
        return {
            topPerformers: sorted.slice(0, 3).filter(c => c.current > 0),
            needsWork: sorted.slice(-3).filter(c => c.current < 50).reverse(),
            improving: categoryPerformance.filter(c => c.trend > 10).sort((a, b) => b.trend - a.trend).slice(0, 3),
            declining: categoryPerformance.filter(c => c.trend < -10).sort((a, b) => a.trend - b.trend).slice(0, 3),
        };
    }, [categoryPerformance]);

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-center">
                <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setAnalyticsView('performance')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${analyticsView === 'performance'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setAnalyticsView('insights')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${analyticsView === 'insights'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Future Insights
                    </button>
                </div>
            </div>

            {analyticsView === 'performance' ? (
                <>
                    {/* Category Trends */}
                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Category Performance</h3>
                                    <p className="text-sm text-slate-500">You vs Your Past</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {timeRanges.map(({ id, label }) => (
                                    <button
                                        key={id}
                                        onClick={() => setTimeRange(id)}
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeRange === id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* View Mode Toggle & Expand/Collapse */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setPerformanceViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${performanceViewMode === 'list'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    title="List View"
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    onClick={() => setPerformanceViewMode('graph')}
                                    className={`p-2 rounded-md transition-colors ${performanceViewMode === 'graph'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    title="Graph View"
                                >
                                    <BarChart2 size={18} />
                                </button>
                            </div>
                            {performanceViewMode === 'list' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExpandedCategories(new Set(categoryPerformance.map(c => c.name)))}
                                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                                    >
                                        Expand All
                                    </button>
                                    <button
                                        onClick={() => setExpandedCategories(new Set())}
                                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            )}
                        </div>

                        {performanceViewMode === 'graph' ? (
                            /* Graph View */
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryPerformance} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                                        <Tooltip
                                            formatter={(value, name) => [`${value}%`, name === 'current' ? 'Current' : 'Previous']}
                                        />
                                        <Legend />
                                        <Bar dataKey="previous" name="Previous Period" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={15} />
                                        <Bar dataKey="current" name="Current Period" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            /* List View - Category Cards with Activity Details */
                            <div className="space-y-3">
                                {categoryPerformance.map((cat) => {
                                    const catActivities = activities.filter(a => {
                                        const category = categories.find(c => c.name === cat.name);
                                        return category && String(a.categoryId) === String(category.id);
                                    });
                                    const isExpanded = expandedCategories.has(cat.name);
                                    const currentDates = getRangeDates(timeRange);
                                    const validDates = currentDates.filter(d => d <= today);

                                    const toggleExpanded = () => {
                                        const newSet = new Set(expandedCategories);
                                        if (isExpanded) {
                                            newSet.delete(cat.name);
                                        } else {
                                            newSet.add(cat.name);
                                        }
                                        setExpandedCategories(newSet);
                                    };

                                    return (
                                        <div key={cat.name} className="border border-slate-100 rounded-lg overflow-hidden">
                                            {/* Category Header */}
                                            <button
                                                onClick={toggleExpanded}
                                                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: cat.color || '#6366f1' }}
                                                    />
                                                    <span className="font-semibold text-slate-800">{cat.name}</span>
                                                    <span className="text-xs text-slate-500">({catActivities.length} activities)</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{ width: `${cat.current}%`, backgroundColor: cat.current > 70 ? '#10b981' : cat.current > 40 ? '#f59e0b' : '#ef4444' }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{cat.current}%</span>
                                                    </div>
                                                    {cat.trend !== 0 && (
                                                        <span className={`text-xs font-medium ${cat.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {cat.trend > 0 ? '+' : ''}{cat.trend}%
                                                        </span>
                                                    )}
                                                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                                </div>
                                            </button>

                                            {/* Expanded Activities */}
                                            {isExpanded && (
                                                <div className="p-4 bg-white border-t border-slate-100">
                                                    {catActivities.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {catActivities.map(act => {
                                                                const completedDays = validDates.filter(d => logs[d]?.includes(act.id)).length;
                                                                const actRate = validDates.length > 0 ? Math.round((completedDays / validDates.length) * 100) : 0;
                                                                return (
                                                                    <div key={act.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-lg">{act.icon || '📌'}</span>
                                                                            <span className="text-sm text-slate-700">{act.name}</span>
                                                                            {act.hours && <span className="text-xs text-slate-400">({act.hours}h)</span>}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full rounded-full"
                                                                                    style={{ width: `${actRate}%`, backgroundColor: actRate > 70 ? '#10b981' : actRate > 40 ? '#f59e0b' : '#ef4444' }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs font-medium text-slate-600 w-10 text-right">{actRate}%</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-400 italic text-center py-2">No activities in this category</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-emerald-50 border-emerald-100">
                            <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Top Performers
                            </h4>
                            {insights.topPerformers.length > 0 ? (
                                <div className="space-y-2">
                                    {insights.topPerformers.map(cat => (
                                        <div key={cat.name} className="flex items-center justify-between">
                                            <span className="text-sm text-emerald-700 truncate">{cat.name}</span>
                                            <span className="text-sm font-bold text-emerald-600">{cat.current}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-emerald-600 italic">Complete activities to see!</p>
                            )}
                        </Card>

                        <Card className="bg-amber-50 border-amber-100">
                            <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                                <AlertCircle size={16} /> Needs Attention
                            </h4>
                            {insights.needsWork.length > 0 ? (
                                <div className="space-y-2">
                                    {insights.needsWork.map(cat => (
                                        <div key={cat.name} className="flex items-center justify-between">
                                            <span className="text-sm text-amber-700 truncate">{cat.name}</span>
                                            <span className="text-sm font-bold text-amber-600">{cat.current}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-amber-600 italic">All categories healthy!</p>
                            )}
                        </Card>

                        <Card className="bg-blue-50 border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <TrendingUp size={16} /> Improving
                            </h4>
                            {insights.improving.length > 0 ? (
                                <div className="space-y-2">
                                    {insights.improving.map(cat => (
                                        <div key={cat.name} className="flex items-center justify-between">
                                            <span className="text-sm text-blue-700 truncate">{cat.name}</span>
                                            <span className="text-sm font-bold text-blue-600">+{cat.trend}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-blue-600 italic">Build momentum!</p>
                            )}
                        </Card>

                        <Card className="bg-red-50 border-red-100">
                            <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                                <AlertCircle size={16} /> Watch Out
                            </h4>
                            {insights.declining.length > 0 ? (
                                <div className="space-y-2">
                                    {insights.declining.map(cat => (
                                        <div key={cat.name} className="flex items-center justify-between">
                                            <span className="text-sm text-red-700 truncate">{cat.name}</span>
                                            <span className="text-sm font-bold text-red-600">{cat.trend}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-red-600 italic">No declining trends!</p>
                            )}
                        </Card>
                    </div>
                </>
            ) : (
                <>
                    {/* Future Insights View */}
                    {/* Time Range Selector */}
                    <div className="flex justify-end">
                        <div className="flex gap-2">
                            {timeRanges.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setInsightsTimeRange(id)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${insightsTimeRange === id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Energy Balance & Habit Health Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white">
                                    <Battery size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Energy Balance</h3>
                                    <p className="text-sm text-slate-500">Hours logged by energy type</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={burnoutBalance.pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={25}
                                                outerRadius={45}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {burnoutBalance.pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1">
                                    <div className="mb-3">
                                        <p className="text-sm text-slate-500">Status</p>
                                        <p className="text-xl font-bold capitalize" style={{ color: burnoutBalance.statusColor }}>
                                            {burnoutBalance.status}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-red-50 p-2 rounded">
                                            <p className="text-lg font-bold text-red-600">{burnoutBalance.drainingHours.toFixed(1)}h</p>
                                            <p className="text-[10px] text-red-500">Draining</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded">
                                            <p className="text-lg font-bold text-slate-600">{burnoutBalance.neutralHours.toFixed(1)}h</p>
                                            <p className="text-[10px] text-slate-500">Neutral</p>
                                        </div>
                                        <div className="bg-emerald-50 p-2 rounded">
                                            <p className="text-lg font-bold text-emerald-600">{burnoutBalance.restorativeHours.toFixed(1)}h</p>
                                            <p className="text-[10px] text-emerald-500">Restorative</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Habit Health</h3>
                                    <p className="text-sm text-slate-500">Category completion rates</p>
                                </div>
                            </div>

                            {insightsRadarData.length > 2 ? (
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={insightsRadarData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                            <Radar
                                                name="Score"
                                                dataKey="score"
                                                stroke="#6366f1"
                                                fill="#6366f1"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                                    Add more categories to see radar chart
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Future Outcome Prediction Matrix - SECOND */}
                    <OutcomeMatrix categories={categories} activities={activities} logs={logs} />
                </>
            )}
        </div>
    );
};

export default CategorySpecific;
