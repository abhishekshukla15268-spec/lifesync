const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Get stored auth token
 */
const getToken = () => localStorage.getItem('lifesync_token');

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
};

// ==================== AUTH ====================

export const authAPI = {
    register: (name, email, password) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    login: (email, password) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    getMe: () => apiRequest('/auth/me'),
};

// ==================== CATEGORIES ====================

export const categoriesAPI = {
    getAll: () => apiRequest('/categories'),

    create: (name, color) =>
        apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify({ name, color }),
        }),

    update: (id, data) =>
        apiRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiRequest(`/categories/${id}`, {
            method: 'DELETE',
        }),
};

// ==================== ACTIVITIES ====================

export const activitiesAPI = {
    getAll: () => apiRequest('/activities'),

    create: (data) =>
        apiRequest('/activities', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        apiRequest(`/activities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id) =>
        apiRequest(`/activities/${id}`, {
            method: 'DELETE',
        }),
};

// ==================== LOGS ====================

export const logsAPI = {
    getAll: (startDate, endDate) => {
        let query = '/logs';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) query += `?${params.toString()}`;
        return apiRequest(query);
    },

    save: (date, activityIds) =>
        apiRequest('/logs', {
            method: 'POST',
            body: JSON.stringify({ date, activityIds }),
        }),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () => apiRequest('/health');
