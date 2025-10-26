import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Page, Category } from '../types';
import { Card, CardHeader } from '../components/Card';

interface ManageCategoriesProps {
  navigate: (page: Page) => void;
}

const ManageCategories: React.FC<ManageCategoriesProps> = ({ navigate }) => {
  const { categories, addCategory, updateCategory, deleteCategory, addNotification } = useData();
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

  const handleDelete = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this category? Any data types in it will be moved to "Uncategorized".')) {
        try {
            await deleteCategory(id);
            addNotification("Category deleted.", "success");
        } catch(e) {
            addNotification("Failed to delete category.", "error");
        }
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        addNotification("Category name is required.", "error");
        return;
    }

    try {
        if (editingCategory) {
          await updateCategory({ ...editingCategory, ...formData });
          addNotification("Category updated successfully.", "success");
        } else {
          await addCategory(formData);
          addNotification("Category added successfully.", "success");
        }
        handleCancel();
    } catch(e) {
        addNotification("Failed to save category.", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
         <button onClick={() => navigate({ name: 'categories' })} className="mb-4 text-primary-600 hover:underline">
          &larr; Back to Categories View
        </button>
        <Card>
          <CardHeader>All Categories</CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-100 text-xs text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="p-3 font-medium text-neutral-900">{cat.name}</td>
                    <td className="p-3 text-neutral-600">{cat.description}</td>
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
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-300 rounded-lg focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700">Description</label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full shadow-sm sm:text-sm border-neutral-300 rounded-lg focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {editingCategory && <button type="button" onClick={handleCancel} className="bg-white py-2 px-4 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>}
                <button type="submit" className="bg-primary-600 text-white py-2 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-primary-700">
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