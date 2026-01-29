import { useState, useEffect } from 'react';
import { Sidebar, Dashboard, CategorySpecific, MasterData } from './components';
import { INITIAL_CATEGORIES, INITIAL_ACTIVITIES, generateMockLogs } from './data/mockData';
import { getTodayStr } from './utils/dateUtils';

/**
 * Main App component for LifeSync
 */
export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data State
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
    const [logs, setLogs] = useState(() => generateMockLogs());

    // Dashboard State
    const [gridMode, setGridMode] = useState('overview'); // 'overview' | 'edit'
    const [tempTodayLogs, setTempTodayLogs] = useState([]);

    // Initialize today's logs if not present
    useEffect(() => {
        const today = getTodayStr();
        if (!logs[today]) {
            setLogs((prev) => ({ ...prev, [today]: [] }));
        } else {
            setTempTodayLogs(logs[today]);
        }
    }, [logs]);

    // Save today's activity log
    const handleSaveDay = () => {
        const today = getTodayStr();
        setLogs((prev) => ({ ...prev, [today]: tempTodayLogs }));
        setGridMode('overview');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar Navigation */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 md:p-8 mt-14 md:mt-0">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">
                        {activeTab === 'dashboard' ? 'Overview' : activeTab === 'master' ? 'Settings' : 'Analytics'}
                    </h2>
                    <p className="text-slate-500">
                        {activeTab === 'dashboard' && `Welcome back! You're doing great today.`}
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
                        setCategories={setCategories}
                        activities={activities}
                        setActivities={setActivities}
                    />
                )}
            </main>
        </div>
    );
}
