/**
 * Outcome Prediction Scoring Utility
 * 
 * Calculates forward-looking outcomes based on user's activity patterns
 * across 3 dimensions and 3 time horizons
 */

// Category to outcome dimension mapping (weights out of 100)
const CATEGORY_WEIGHTS = {
    // Default mappings - will match against category names
    'health': { career: 20, happiness: 40, longevity: 80 },
    'fitness': { career: 15, happiness: 50, longevity: 85 },
    'productivity': { career: 80, happiness: 30, longevity: 20 },
    'work': { career: 85, happiness: 20, longevity: 10 },
    'mindfulness': { career: 25, happiness: 70, longevity: 60 },
    'meditation': { career: 20, happiness: 80, longevity: 55 },
    'social': { career: 40, happiness: 75, longevity: 45 },
    'family': { career: 20, happiness: 85, longevity: 50 },
    'learning': { career: 70, happiness: 45, longevity: 30 },
    'education': { career: 75, happiness: 40, longevity: 25 },
    'hobby': { career: 15, happiness: 80, longevity: 35 },
    'creative': { career: 35, happiness: 70, longevity: 30 },
    'sleep': { career: 30, happiness: 50, longevity: 90 },
    'rest': { career: 25, happiness: 55, longevity: 70 },
    'exercise': { career: 20, happiness: 55, longevity: 90 },
    'nutrition': { career: 15, happiness: 40, longevity: 85 },
    'finance': { career: 70, happiness: 35, longevity: 25 },
};

// Default weights for unknown categories
const DEFAULT_WEIGHTS = { career: 33, happiness: 33, longevity: 33 };

/**
 * Match category name to weight profile
 */
const getCategoryWeights = (categoryName) => {
    const lowerName = categoryName.toLowerCase();

    for (const [key, weights] of Object.entries(CATEGORY_WEIGHTS)) {
        if (lowerName.includes(key)) {
            return weights;
        }
    }

    return DEFAULT_WEIGHTS;
};

/**
 * Calculate outcome scores for all dimensions and horizons
 * 
 * @param {Array} categories - User's categories
 * @param {Array} activities - User's activities with hours
 * @param {Object} logs - Activity completion logs
 * @returns {Object} Outcome matrix with scores
 */
export const calculateOutcomeMatrix = (categories, activities, logs) => {
    // Calculate total daily hours committed
    const totalHours = activities.reduce((sum, act) => sum + (act.hours || 0), 0);

    // Calculate weighted hours per dimension
    const dimensionHours = { career: 0, happiness: 0, longevity: 0 };

    activities.forEach(act => {
        const category = categories.find(c => String(c.id) === String(act.categoryId));
        if (!category) return;

        const weights = getCategoryWeights(category.name);
        const actHours = act.hours || 0;

        // Weight the hours by category impact
        dimensionHours.career += (actHours * weights.career) / 100;
        dimensionHours.happiness += (actHours * weights.happiness) / 100;
        dimensionHours.longevity += (actHours * weights.longevity) / 100;
    });

    // Calculate compliance rate from logs (last 30 days)
    const today = new Date();
    let totalExpected = 0;
    let totalCompleted = 0;

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-CA');

        if (dateStr <= today.toLocaleDateString('en-CA')) {
            totalExpected += activities.length;
            totalCompleted += logs[dateStr]?.length || 0;
        }
    }

    const complianceRate = totalExpected > 0 ? totalCompleted / totalExpected : 0;

    // Calculate base scores (0-100)
    const maxDailyHours = 24;
    const calculateBaseScore = (dimensionHour) => {
        // Normalize: 4 hours of focused time = 70 base score
        const normalized = Math.min((dimensionHour / 4) * 70, 100);
        return normalized;
    };

    const baseScores = {
        career: calculateBaseScore(dimensionHours.career),
        happiness: calculateBaseScore(dimensionHours.happiness),
        longevity: calculateBaseScore(dimensionHours.longevity),
    };

    // Time horizon multipliers (compounding effect)
    const horizonMultipliers = {
        '1yr': { compounding: 1.0, consistency: 0.3 },
        '5yr': { compounding: 1.5, consistency: 0.5 },
        '10yr': { compounding: 2.2, consistency: 0.7 },
    };

    // Calculate final scores with compliance adjustment
    const matrix = {};

    Object.entries(horizonMultipliers).forEach(([horizon, { compounding, consistency }]) => {
        matrix[horizon] = {};

        ['career', 'happiness', 'longevity'].forEach(dimension => {
            // Base score adjusted by compliance and compounding
            const effectiveCompliance = complianceRate * consistency + (1 - consistency);
            let score = baseScores[dimension] * compounding * effectiveCompliance;

            // Cap at 100, floor at 0
            score = Math.min(Math.max(Math.round(score), 0), 100);

            matrix[horizon][dimension] = score;
        });
    });

    // Add metadata
    return {
        matrix,
        meta: {
            totalHoursTracked: totalHours,
            complianceRate: Math.round(complianceRate * 100),
            dimensionHours,
            baseScores,
        }
    };
};

/**
 * Get score level label
 */
export const getScoreLevel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: '#10b981' };
    if (score >= 60) return { label: 'Good', color: '#3b82f6' };
    if (score >= 40) return { label: 'Moderate', color: '#f59e0b' };
    if (score >= 20) return { label: 'Fair', color: '#f97316' };
    return { label: 'Needs Work', color: '#ef4444' };
};

/**
 * Get dimension icon and description
 */
export const getDimensionInfo = (dimension) => {
    const info = {
        career: {
            icon: '💼',
            label: 'Career & Financial',
            description: 'Professional growth, skills, wealth building'
        },
        happiness: {
            icon: '😊',
            label: 'Happiness & Well-being',
            description: 'Mental health, relationships, fulfillment'
        },
        longevity: {
            icon: '💪',
            label: 'Longevity & Health',
            description: 'Physical health, energy, life quality'
        }
    };
    return info[dimension] || { icon: '📊', label: dimension, description: '' };
};
