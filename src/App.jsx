import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login, Register } from './pages';
import { Sidebar, Dashboard, CategorySpecific, MasterData } from './components';
import { categoriesAPI, activitiesAPI, logsAPI } from './services/api';
import { getTodayStr } from './utils/dateUtils';
import { Activity } from 'lucide-react';

/**
 * Main app content (requires auth)
 */
function AppContent() {
    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    const [authView, setAuthView] = useState('login'); // 'login' | 'register'

    const [activeTab, setActiveTab] = useState('dashboard');

    // Data State
    const [categories, setCategories] = useState([]);
    const [activities, setActivities] = useState([]);
    const [logs, setLogs] = useState({});
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dashboard State
    const [gridMode, setGridMode] = useState('overview');
    const [tempTodayLogs, setTempTodayLogs] = useState([]);

    // Load data from API
    const loadData = useCallback(async () => {
        if (!isAuthenticated) return;

        setDataLoading(true);
        setError(null);

        try {
            const [catData, actData, logData] = await Promise.all([
                categoriesAPI.getAll(),
                activitiesAPI.getAll(),
                logsAPI.getAll(),
            ]);

            setCategories(catData.categories || []);
            setActivities(actData.activities || []);
            setLogs(logData.logs || {});

            // Initialize today's temp logs
            const today = getTodayStr();
            setTempTodayLogs(logData.logs?.[today] || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load data. Please check if the server is running.');
        }

        setDataLoading(false);
    }, [isAuthenticated]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Save today's log
    const handleSaveDay = async () => {
        const today = getTodayStr();
        try {
            await logsAPI.save(today, tempTodayLogs);
            setLogs((prev) => ({ ...prev, [today]: tempTodayLogs }));
            setGridMode('overview');
        } catch (err) {
            console.error('Failed to save logs:', err);
            alert('Failed to save. Please try again.');
        }
    };

    // Category CRUD with API
    const handleSetCategories = async (updater) => {
        if (typeof updater === 'function') {
            // For delete operations from MasterData
            const newCategories = updater(categories);
            setCategories(newCategories);
        } else {
            setCategories(updater);
        }
    };

    const handleAddCategory = async (name, color) => {
        try {
            const { category } = await categoriesAPI.create(name, color);
            setCategories((prev) => [...prev, category]);
            return category;
        } catch (err) {
            console.error('Failed to create category:', err);
            throw err;
        }
    };

    const handleUpdateCategory = async (id, data) => {
        try {
            const { category } = await categoriesAPI.update(id, data);
            setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
            return category;
        } catch (err) {
            console.error('Failed to update category:', err);
            throw err;
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await categoriesAPI.delete(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setActivities((prev) => prev.filter((a) => a.categoryId !== id));
        } catch (err) {
            console.error('Failed to delete category:', err);
            throw err;
        }
    };

    // Activity CRUD with API
    const handleSetActivities = async (updater) => {
        if (typeof updater === 'function') {
            const newActivities = updater(activities);
            setActivities(newActivities);
        } else {
            setActivities(updater);
        }
    };

    const handleAddActivity = async (data) => {
        try {
            const { activity } = await activitiesAPI.create(data);
            setActivities((prev) => [...prev, activity]);
            return activity;
        } catch (err) {
            console.error('Failed to create activity:', err);
            throw err;
        }
    };

    const handleUpdateActivity = async (id, data) => {
        try {
            const { activity } = await activitiesAPI.update(id, data);
            setActivities((prev) => prev.map((a) => (a.id === id ? activity : a)));
            return activity;
        } catch (err) {
            console.error('Failed to update activity:', err);
            throw err;
        }
    };

    const handleDeleteActivity = async (id) => {
        try {
            await activitiesAPI.delete(id);
            setActivities((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error('Failed to delete activity:', err);
            throw err;
        }
    };

    // Show loading spinner during auth check
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 animate-pulse">
                        <Activity size={32} className="text-white" />
                    </div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login/register if not authenticated
    if (!isAuthenticated) {
        if (authView === 'register') {
            return <Register onSwitchToLogin={() => setAuthView('login')} />;
        }
        return <Login onSwitchToRegister={() => setAuthView('register')} />;
    }

    // Show loading while fetching data
    if (dataLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading your data...</p>
                </div>
            </div>
        );
    }

    // Show error if data loading failed
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <p className="text-sm text-slate-500 mb-4">
                        Make sure the backend server is running:<br />
                        <code className="bg-slate-100 px-2 py-1 rounded">npm run server</code>
                    </p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                onLogout={logout}
            />

            <main className="flex-1 md:ml-64 p-6 md:p-8 mt-14 md:mt-0">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">
                        {activeTab === 'dashboard' ? 'Overview' : activeTab === 'master' ? 'Settings' : 'Analytics'}
                    </h2>
                    <p className="text-slate-500">
                        {activeTab === 'dashboard' && `Welcome back, ${user?.name || 'User'}! You're doing great today.`}
                        {activeTab === 'categories' && `Deep dive into your habits.`}
                        {activeTab === 'master' && `Manage your tracking preferences.`}
                    </p>
                </header>

                {activeTab === 'dashboard' && (
                    <Dashboard
                        categories={categories}
                        activities={activities}
                        logs={logs}
                        gridMode={gridMode}
                        setGridMode={setGridMode}
                        tempTodayLogs={tempTodayLogs}
                        setTempTodayLogs={setTempTodayLogs}
                        handleSaveDay={handleSaveDay}
                    />
                )}
                {activeTab === 'categories' && (
                    <CategorySpecific categories={categories} activities={activities} logs={logs} />
                )}
                {activeTab === 'master' && (
                    <MasterData
                        categories={categories}
                        setCategories={handleSetCategories}
                        activities={activities}
                        setActivities={handleSetActivities}
                        onAddCategory={handleAddCategory}
                        onUpdateCategory={handleUpdateCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onAddActivity={handleAddActivity}
                        onUpdateActivity={handleUpdateActivity}
                        onDeleteActivity={handleDeleteActivity}
                    />
                )}
            </main>
        </div>
    );
}

/**
 * Main App component with AuthProvider wrapper
 */
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
