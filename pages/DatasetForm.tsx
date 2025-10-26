import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, Dataset } from '../types';

interface DatasetFormProps {
  id?: string;
  navigate: (page: Page) => void;
}

const DatasetForm: React.FC<DatasetFormProps> = ({ id, navigate }) => {
  const { state, getters, actions } = useData();
  const { dataTypes } = state;
  const { getDatasetById, getDataTypesForDataset } = getters;
  const { addDataset, updateDataset, deleteDataset, addNotification } = actions;

  const [formData, setFormData] = useState<Omit<Dataset, 'id' | 'created_at'> & { linkedDataTypeIds: string[] }>({ 
    name: '', description: '', 
    data_provider: '', data_governance: '', 
    technical_details: '', resource_links: [], 
    linkedDataTypeIds: [] 
  });

  useEffect(() => {
    if (id) {
      const existingDataset = getDatasetById(id);
      if (existingDataset) {
        const linkedDataTypes = getDataTypesForDataset(id);
        setFormData({
          ...existingDataset,
          linkedDataTypeIds: linkedDataTypes.map(dt => dt.id),
        });
      }
    }
  }, [id, getDatasetById, getDataTypesForDataset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkToggle = (dataTypeId: string) => {
    setFormData(prev => {
      const linkedDataTypeIds = prev.linkedDataTypeIds.includes(dataTypeId)
        ? prev.linkedDataTypeIds.filter(id => id !== dataTypeId)
        : [...prev.linkedDataTypeIds, dataTypeId];
      return { ...prev, linkedDataTypeIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
        addNotification('Dataset name is required', 'error');
        return;
    }

    const { linkedDataTypeIds, ...datasetData } = formData;

    try {
        if (id) {
            await updateDataset({ dataset: { ...datasetData, id }, linkedDataTypeIds });
        } else {
            await addDataset({ dataset: datasetData, linkedDataTypeIds });
        }
        navigate({ name: 'datasets' });
    } catch (error) {
        console.error('Form submission error:', error);
    }
  };
  
  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this dataset?')) {
        await deleteDataset(id);
        navigate({ name: 'datasets' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Dataset' : 'Add Dataset'}</h1>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Linked Data Types</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {dataTypes.map(dt => (
            <div key={dt.id} className="flex items-center">
              <input 
                type="checkbox" 
                id={`dt-${dt.id}`} 
                checked={formData.linkedDataTypeIds.includes(dt.id)} 
                onChange={() => handleLinkToggle(dt.id)} 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor={`dt-${dt.id}`} className="ml-2 text-sm text-gray-600">{dt.name}</label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Other form fields can be added here following the same pattern */}
      
      <div className="flex justify-between mt-6">
        <div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">{id ? 'Update' : 'Save'} Dataset</button>
          <button type="button" onClick={() => navigate({ name: id ? 'datasetDetail' : 'datasets', id })} className="ml-2 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100">Cancel</button>
        </div>
        {id && (
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Delete Dataset</button>
        )}
      </div>
    </form>
  );
};

export default DatasetForm;
