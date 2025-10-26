import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType } from '../types';

interface DataTypeFormProps {
  id?: string;
  navigate: (page: Page) => void;
}

const DataTypeForm: React.FC<DataTypeFormProps> = ({ id, navigate }) => {
  const { state, getters, actions } = useData();
  const { datasets, categories } = state;
  const { getDataTypeById, getDatasetsForDataType } = getters;
  const { addDataType, updateDataType, deleteDataType, addNotification } = actions;

  const [formData, setFormData] = useState<Omit<DataType, 'id' | 'created_at'> & { linkedDatasetIds: string[] }>({ 
    uid: '', name: '', description: '', category: '', data_format: '', 
    update_frequency: '', data_source: '', collection_storage_details: '', 
    security_privacy_notes: '', api_details: '', linkedDatasetIds: [] 
  });

  useEffect(() => {
    if (id) {
      const existingDataType = getDataTypeById(id);
      if (existingDataType) {
        const linkedDatasets = getDatasetsForDataType(id);
        setFormData({
          ...existingDataType,
          linkedDatasetIds: linkedDatasets.map(ds => ds.id),
        });
      }
    }
  }, [id, getDataTypeById, getDatasetsForDataType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkToggle = (datasetId: string) => {
    setFormData(prev => {
      const linkedDatasetIds = prev.linkedDatasetIds.includes(datasetId)
        ? prev.linkedDatasetIds.filter(id => id !== datasetId)
        : [...prev.linkedDatasetIds, datasetId];
      return { ...prev, linkedDatasetIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      addNotification('Name and category are required', 'error');
      return;
    }

    const { linkedDatasetIds, ...dataTypeData } = formData;
    
    try {
      if (id) {
        await updateDataType({ dataType: { ...dataTypeData, id }, linkedDatasetIds });
      } else {
        await addDataType({ dataType: dataTypeData, linkedDatasetIds });
      }
      navigate({ name: 'dataTypes' });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this data type?')) {
      await deleteDataType(id);
      navigate({ name: 'dataTypes' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Data Type' : 'Add Data Type'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
            <option value="">Select a category</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
        
        <div>
            <label htmlFor="uid" className="block text-sm font-medium text-gray-700">UID</label>
            <input type="text" name="uid" id="uid" value={formData.uid} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Linked Datasets</label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {datasets.map(ds => (
            <div key={ds.id} className="flex items-center">
              <input 
                type="checkbox" 
                id={`ds-${ds.id}`} 
                checked={formData.linkedDatasetIds.includes(ds.id)} 
                onChange={() => handleLinkToggle(ds.id)} 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={`ds-${ds.id}`} className="ml-2 text-sm text-gray-600">{ds.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-sm">{id ? 'Update' : 'Save'}</button>
          <button type="button" onClick={() => navigate({ name: id ? 'dataTypeDetail' : 'dataTypes', id })} className="ml-2 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100">Cancel</button>
        </div>
        {id && (
          <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 shadow-sm">Delete</button>
        )}
      </div>
    </form>
  );
};

export default DataTypeForm;
