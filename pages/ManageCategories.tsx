import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Page, Category } from '../types';
import { Card, CardHeader } from '../components/Card';

interface ManageCategoriesProps {
  navigate: (page: Page) => void;
}

const ManageCategories: React.FC<ManageCategoriesProps> = ({ navigate }) => {
  const { categories, dataTypes, addCategory, updateCategory, deleteCategory, regenerateCategoriesFromDataTypes, addNotification } = useData();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const inputClasses = "block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = async (id: string) => {
      const category = categories.find(c => c.id === id);
      if (!category) return;

      // Count affected data types
      const affectedCount = dataTypes.filter(dt => dt.category === category.name).length;

      const message = affectedCount > 0
        ? `Are you sure you want to delete "${category.name}"?\n\n${affectedCount} data type(s) will be moved to "Uncategorized".`
        : `Are you sure you want to delete "${category.name}"?`;

      if (window.confirm(message)) {
        try {
            await deleteCategory(id);
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : "Failed to delete category.";
            addNotification(errorMessage, "error");
        }
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
        addNotification("Category name is required.", "error");
        return;
    }

    try {
        if (editingCategory) {
          // Count data types that will be affected by name change
          const isNameChanged = formData.name.trim() !== editingCategory.name;
          if (isNameChanged) {
            const affectedCount = dataTypes.filter(dt => dt.category === editingCategory.name).length;
            if (affectedCount > 0) {
              const confirmed = window.confirm(
                `Renaming this category will update ${affectedCount} data type(s).\n\nContinue?`
              );
              if (!confirmed) return;
            }
          }

          await updateCategory(editingCategory.id, formData);
        } else {
          await addCategory(formData);
        }
        handleCancel();
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to save category.";
        addNotification(errorMessage, "error");
    }
  };

  const handleRegenerateCategories = async () => {
    if (window.confirm('This will regenerate all categories from the current Data Types.\n\nAny manually created categories that are not used by Data Types will be removed.\n\nContinue?')) {
      try {
        await regenerateCategoriesFromDataTypes();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to regenerate categories.";
        addNotification(errorMessage, "error");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
         <div className="flex justify-between items-center mb-4">
           <button onClick={() => navigate({ name: 'categories' })} className="text-primary-600 hover:underline">
            &larr; Back to Categories View
          </button>
          <button
            onClick={handleRegenerateCategories}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
          >
            Regenerate from Data Types
          </button>
         </div>
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
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-white py-2 px-4 border border-neutral-300 rounded-lg shadow-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-primary-600 text-white py-2 px-4 rounded-lg shadow-sm font-medium hover:bg-primary-700 transition-colors"
                >
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