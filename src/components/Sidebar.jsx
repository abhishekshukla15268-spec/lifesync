import { Activity, LayoutDashboard, PieChart, Settings } from 'lucide-react';

/**
 * Sidebar navigation component
 */
export const Sidebar = ({ activeTab, setActiveTab }) => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                        <Activity /> LifeSync
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'categories'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <PieChart size={20} /> Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('master')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'master'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Settings size={20} /> Settings
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                            JD
                        </div>
                        <div>
                            <p className="text-sm font-medium">John Doe</p>
                            <p className="text-xs text-slate-500">Free Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Header */}
            <div className="md:hidden fixed w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
                <h1 className="font-bold flex items-center gap-2 text-indigo-400">
                    <Activity /> LifeSync
                </h1>
                <div className="flex gap-4">
                    <LayoutDashboard
                        onClick={() => setActiveTab('dashboard')}
                        className={`cursor-pointer ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}
                    />
                    <PieChart
                        onClick={() => setActiveTab('categories')}
                        className={`cursor-pointer ${activeTab === 'categories' ? 'text-indigo-400' : 'text-slate-400'}`}
                    />
                    <Settings
                        onClick={() => setActiveTab('master')}
                        className={`cursor-pointer ${activeTab === 'master' ? 'text-indigo-400' : 'text-slate-400'}`}
                    />
                </div>
            </div>
        </>
    );
};

export default Sidebar;
