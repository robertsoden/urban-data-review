import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Page, Category } from '../types';
import Card, { CardHeader } from '../components/Card';

interface ManageCategoriesProps {
  navigate: (page: Page) => void;
}

const ManageCategories: React.FC<ManageCategoriesProps> = ({ navigate }) => {
  const { categories, dispatch, addNotification } = useData();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = (id: number) => {
      if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
        addNotification("Category deleted (if not in use).", "success");
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        addNotification("Category name is required.", "error");
        return;
    }

    if (editingCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...editingCategory, ...formData } });
      addNotification("Category updated successfully.", "success");
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: formData });
      addNotification("Category added successfully.", "success");
    }
    handleCancel();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
         <button onClick={() => navigate({ name: 'categories' })} className="mb-4 text-button-blue hover:underline">
          &larr; Back to Categories View
        </button>
        <Card>
          <CardHeader>All Categories</CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="p-3 font-medium text-slate-900">{cat.name}</td>
                    <td className="p-3 text-slate-600">{cat.description}</td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => handleEditClick(cat)} className="text-yellow-600 hover:underline font-semibold">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:underline font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div>
       <div className="mb-4 text-transparent">.</div> {/* Spacer */}
        <Card>
          <CardHeader>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {editingCategory && <button type="button" onClick={handleCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>}
                <button type="submit" className="bg-button-blue text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-600">
                    {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ManageCategories;
