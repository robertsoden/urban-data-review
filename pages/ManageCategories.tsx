import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Category } from '../types';
import Card, { CardHeader } from '../components/Card';

const ManageCategories: React.FC = () => {
  const { state, actions } = useData();
  const { categories } = state;
  const { addCategory, updateCategory, deleteCategory } = actions;
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAdd = async () => {
    if (newCategoryName.trim()) {
      await addCategory({ name: newCategoryName.trim(), color: '#cccccc' }); // Default color
      setNewCategoryName('');
    }
  };

  const handleUpdate = async (category: Category) => {
    if (editingCategory && editingCategory.name.trim()) {
      await updateCategory(editingCategory);
      setEditingCategory(null);
    }
  };

  return (
    <Card>
      <CardHeader>Manage Categories</CardHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-grow p-2 border rounded-md"
          />
          <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded-md">Add</button>
        </div>

        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center gap-2 p-2 border rounded-md">
              {editingCategory?.id === cat.id ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="flex-grow p-1 border rounded-md"
                />
              ) : (
                <span className="flex-grow">{cat.name}</span>
              )}
              
              {editingCategory?.id === cat.id ? (
                <button onClick={() => handleUpdate(cat)} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm">Save</button>
              ) : (
                <button onClick={() => setEditingCategory(cat)} className="bg-gray-200 px-3 py-1 rounded-md text-sm">Edit</button>
              )}
              <button onClick={() => deleteCategory(cat.id)} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default ManageCategories;
