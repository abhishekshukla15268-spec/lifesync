import { useState } from 'react';
import { Plus, Save, Trash2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card } from './ui';

/**
 * MasterData component - Settings for managing activities and categories
 */
export const MasterData = ({
    categories,
    setCategories,
    activities,
    setActivities,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onAddActivity,
    onUpdateActivity,
    onDeleteActivity,
}) => {
    const [view, setView] = useState('activities');
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        categoryId: '',
        type: 'free',
        time: '',
        color: '#6366f1',
    });

    const handleViewChange = (newView) => {
        setView(newView);
        setEditingItem(null);
        if (newView === 'activities') {
            setNewItem({ name: '', categoryId: '', type: 'free', time: '' });
        } else {
            setNewItem({ name: '', color: '#6366f1' });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (view === 'activities') {
                if (!newItem.name || !newItem.categoryId) {
                    setSaving(false);
                    return;
                }
                if (newItem.type === 'time-bound' && !newItem.time) {
                    setSaving(false);
                    return;
                }

                const data = {
                    name: newItem.name,
                    categoryId: parseInt(newItem.categoryId),
                    type: newItem.type,
                    time: newItem.type === 'time-bound' ? newItem.time : '',
                };

                if (editingItem) {
                    await onUpdateActivity(editingItem, data);
                } else {
                    await onAddActivity(data);
                }
                setNewItem({ name: '', categoryId: '', type: 'free', time: '' });
            } else {
                if (!newItem.name) {
                    setSaving(false);
                    return;
                }

                if (editingItem) {
                    await onUpdateCategory(editingItem, { name: newItem.name, color: newItem.color });
                } else {
                    await onAddCategory(newItem.name, newItem.color || '#6366f1');
                }
                setNewItem({ name: '', color: '#6366f1' });
            }
            setEditingItem(null);
        } catch (err) {
            alert('Failed to save: ' + err.message);
        }
        setSaving(false);
    };

    const handleEditStart = (item) => {
        setEditingItem(item.id);
        setNewItem({ ...item, categoryId: item.categoryId?.toString() || '' });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        if (view === 'activities') {
            setNewItem({ name: '', categoryId: '', type: 'free', time: '' });
        } else {
            setNewItem({ name: '', color: '#6366f1' });
        }
    };

    const handleDeleteActivity = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete this activity?')) return;
        try {
            await onDeleteActivity(id);
            if (editingItem === id) handleCancelEdit();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const handleDeleteCategory = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete this category and all its activities?')) return;
        try {
            await onDeleteCategory(id);
            if (editingItem === id) handleCancelEdit();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 border-b border-slate-200">
                <button
                    onClick={() => handleViewChange('activities')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${view === 'activities'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Activities
                </button>
                <button
                    onClick={() => handleViewChange('categories')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${view === 'categories'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Categories
                </button>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">
                        {editingItem
                            ? `Edit ${view === 'activities' ? 'Activity' : 'Category'}`
                            : `Add ${view === 'activities' ? 'Activity' : 'Category'}`}
                    </h3>
                    {editingItem && (
                        <button
                            onClick={handleCancelEdit}
                            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                            <XCircle size={16} /> Cancel Edit
                        </button>
                    )}
                </div>

                {/* Add/Edit Form */}
                <div
                    className={`flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-lg items-end border ${editingItem ? 'border-indigo-200 bg-indigo-50/30' : 'border-transparent'
                        }`}
                >
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">
                            {view === 'activities' ? 'Activity Name' : 'Category Name'}
                        </label>
                        <input
                            type="text"
                            placeholder="Name..."
                            className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>

                    {view === 'activities' && (
                        <>
                            <div className="w-full md:w-48 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newItem.categoryId}
                                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-32 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Type</label>
                                <select
                                    className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newItem.type}
                                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                >
                                    <option value="free">Anytime</option>
                                    <option value="time-bound">Time Bound</option>
                                </select>
                            </div>

                            {newItem.type === 'time-bound' && (
                                <div className="w-full md:w-32 space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newItem.time}
                                        onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {view === 'categories' && (
                        <div className="w-full md:w-32 space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Color</label>
                            <div className="flex items-center gap-2 h-[42px]">
                                <input
                                    type="color"
                                    className="h-10 w-full rounded cursor-pointer"
                                    value={newItem.color}
                                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-4 py-2 text-white rounded-md font-medium flex items-center gap-2 h-[42px] min-w-[100px] justify-center transition-colors disabled:opacity-50 ${editingItem ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {saving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : editingItem ? (
                            <Save size={18} />
                        ) : (
                            <Plus size={18} />
                        )}
                        {editingItem ? 'Update' : 'Add'}
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        {view === 'activities' ? 'Click row to edit activity' : 'Click row to edit category'}
                    </h4>
                    {view === 'activities' ? (
                        activities.length === 0 ? (
                            <p className="text-slate-500 text-sm italic py-4">
                                No activities yet. Add your first activity above.
                            </p>
                        ) : (
                            activities.map((act) => (
                                <div
                                    key={act.id}
                                    onClick={() => handleEditStart(act)}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${editingItem === act.id
                                            ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50'
                                            : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-medium text-slate-800">{act.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {categories.find((c) => c.id === act.categoryId)?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        {act.type === 'time-bound' && act.time && (
                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                <Clock size={12} /> {act.time}
                                            </span>
                                        )}
                                        {act.type === 'free' && (
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                                Anytime
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleDeleteActivity(e, act.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete Activity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : categories.length === 0 ? (
                        <p className="text-slate-500 text-sm italic py-4">
                            No categories yet. Add your first category above.
                        </p>
                    ) : (
                        categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleEditStart(cat)}
                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${editingItem === cat.id
                                        ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50'
                                        : 'border-slate-100 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-6 h-6 rounded-md shadow-sm border border-slate-200"
                                        style={{ backgroundColor: cat.color }}
                                    ></div>
                                    <p className="font-medium text-slate-800">{cat.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => handleDeleteCategory(e, cat.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete Category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default MasterData;
