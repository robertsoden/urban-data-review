import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Page, InspireTheme } from '../types';
import { Card, CardHeader, CardContent } from '../components/Card';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '../components/Icons';

interface ManageCategoriesProps {
  navigate: (page: Page) => void;
}

const ManageCategories: React.FC<ManageCategoriesProps> = ({ navigate }) => {
  const { inspireThemes, dataTypes, addCategory, updateCategory, deleteCategory, addNotification } = useData();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const getDataTypeCount = (themeName: string) => {
    return dataTypes.filter(dt => dt.inspire_theme === themeName).length;
  };

  const handleStartEdit = (theme: InspireTheme) => {
    setEditingId(theme.id);
    setEditName(theme.name);
    setEditDescription(theme.description);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      await updateCategory(editingId, {
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingId(null);
      setEditName('');
      setEditDescription('');
    } catch (error: any) {
      addNotification(error.message, 'error');
    }
  };

  const handleDelete = async (theme: InspireTheme) => {
    const count = getDataTypeCount(theme.name);
    if (count > 0) {
      addNotification(`Cannot delete "${theme.name}" because it is used by ${count} data type(s).`, 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${theme.name}"?`)) {
      try {
        await deleteCategory(theme.id);
      } catch (error: any) {
        addNotification(error.message, 'error');
      }
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      addNotification('Category name is required.', 'error');
      return;
    }

    try {
      await addCategory({
        name: newName.trim(),
        description: newDescription.trim()
      });
      setNewName('');
      setNewDescription('');
      setIsAdding(false);
    } catch (error: any) {
      addNotification(error.message, 'error');
    }
  };

  const inputClasses = "block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate({ name: 'inspire-themes' })}
          className="mb-4 text-primary-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Categories
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Manage Categories</h1>
            <p className="mt-1 text-neutral-600">Add, edit, or delete categories</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
            >
              Add Category
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>Add New Category</CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className={inputClasses}
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className={inputClasses}
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                  Save Category
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewName(''); setNewDescription(''); }}
                  className="bg-white text-neutral-700 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-center">Data Types</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {inspireThemes.map(theme => (
                <tr key={theme.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    {editingId === theme.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className={inputClasses}
                      />
                    ) : (
                      <span className="font-medium text-neutral-900">{theme.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === theme.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className={inputClasses}
                      />
                    ) : (
                      <span className="text-neutral-600">{theme.description || <span className="italic text-neutral-400">No description</span>}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {getDataTypeCount(theme.name)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === theme.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-neutral-600 hover:text-neutral-700 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStartEdit(theme)}
                          className="p-1 text-neutral-500 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(theme)}
                          className={`p-1 transition-colors ${getDataTypeCount(theme.name) > 0 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-500 hover:text-red-600'}`}
                          title={getDataTypeCount(theme.name) > 0 ? 'Cannot delete - has data types' : 'Delete'}
                          disabled={getDataTypeCount(theme.name) > 0}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {inspireThemes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-neutral-500">
                    No categories found. Add a category to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageCategories;
