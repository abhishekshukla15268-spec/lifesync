import { useMemo } from 'react';
import { Target, Sparkles, Calendar } from 'lucide-react';
import { Card } from './ui';
import { calculateOutcomeMatrix, getScoreLevel, getDimensionInfo } from '../utils/outcomeCalculator';

/**
 * OutcomeMatrix component - Forward-looking life outcome predictions
 */
export const OutcomeMatrix = ({ categories, activities, logs }) => {
    const { matrix, meta } = useMemo(
        () => calculateOutcomeMatrix(categories, activities, logs),
        [categories, activities, logs]
    );

    const dimensions = ['career', 'happiness', 'longevity'];
    const horizons = [
        { key: '1yr', label: '1 Year', icon: '📅' },
        { key: '5yr', label: '5 Years', icon: '📆' },
        { key: '10yr', label: '10 Years', icon: '🎯' },
    ];

    // Circular progress component
    const CircularScore = ({ score, size = 80 }) => {
        const { color } = getScoreLevel(score);
        const radius = (size - 10) / 2;
        const circumference = 2 * Math.PI * radius;
        const progress = (score / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="6"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold" style={{ color }}>{score}</span>
                </div>
            </div>
        );
    };

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Future Outcome Prediction</h3>
                    <p className="text-sm text-slate-500">Based on your current activities and consistency</p>
                </div>
            </div>

            {/* Dimension Cards */}
            <div className="space-y-4">
                {dimensions.map((dimension) => {
                    const info = getDimensionInfo(dimension);
                    return (
                        <div
                            key={dimension}
                            className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100"
                        >
                            <div className="flex items-center justify-between">
                                {/* Dimension Info */}
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{info.icon}</span>
                                    <div>
                                        <p className="font-bold text-slate-800">{info.label}</p>
                                        <p className="text-xs text-slate-500">{info.description}</p>
                                    </div>
                                </div>

                                {/* Scores Row */}
                                <div className="flex items-center gap-6">
                                    {horizons.map(({ key, label }) => {
                                        const score = matrix[key][dimension];
                                        const { label: scoreLabel, color } = getScoreLevel(score);
                                        return (
                                            <div key={key} className="text-center">
                                                <CircularScore score={score} size={60} />
                                                <p className="text-[10px] text-slate-500 mt-1 font-medium">{label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Meta Stats */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{meta.totalHoursTracked.toFixed(1)}h</p>
                    <p className="text-xs text-slate-500">Daily Hours</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{meta.complianceRate}%</p>
                    <p className="text-xs text-slate-500">30-Day Consistency</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{activities.length}</p>
                    <p className="text-xs text-slate-500">Activities</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                    <p className="text-xs text-slate-500">Categories</p>
                </div>
            </div>

            {/* Insight Tip */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-start gap-3">
                    <Target size={20} className="text-indigo-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-indigo-900">How to improve your scores</p>
                        <p className="text-xs text-indigo-700 mt-1">
                            {meta.complianceRate < 50
                                ? "Focus on consistency! Complete activities daily to see significant improvements."
                                : meta.totalHoursTracked < 4
                                    ? "Consider adding more structured hours to activities that matter most to you."
                                    : "Great job! Keep up your current habits and watch your long-term projections grow."
                            }
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OutcomeMatrix;
