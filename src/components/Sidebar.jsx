import { Activity, LayoutDashboard, PieChart, Settings, LogOut } from 'lucide-react';

/**
 * Sidebar navigation component
 */
export const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
    // Get user initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

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
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                                {getInitials(user?.name)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[120px]">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Header */}
            <div className="md:hidden fixed w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
                <h1 className="font-bold flex items-center gap-2 text-indigo-400">
                    <Activity /> LifeSync
                </h1>
                <div className="flex gap-4 items-center">
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
                    <button
                        onClick={onLogout}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
