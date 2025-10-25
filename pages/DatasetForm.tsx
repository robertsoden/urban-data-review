import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, Dataset } from '../types';
import Card from '../components/Card';

interface DatasetFormProps {
  navigate: (page: Page) => void;
  id?: string;
}

const DatasetForm: React.FC<DatasetFormProps> = ({ navigate, id }) => {
  const { dataTypes, getDatasetById, getDataTypesForDataset, addDataset, updateDataset, deleteDataset, addNotification } = useData();
  const isEditMode = id !== undefined;
  
  const [formData, setFormData] = useState<Omit<Dataset, 'id' | 'created_at'> | Dataset>({
    name: '', url: '', description: '', source_organization: '', source_type: '',
    geographic_coverage: '', temporal_coverage: '', format: '', resolution: '',
    access_type: 'Open', license: '', is_validated: false, is_primary_example: false,
    quality_notes: '', used_in_projects: '', notes: '',
  });
  const [linkedDataTypeIds, setLinkedDataTypeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isEditMode) {
      const dataset = getDatasetById(id);
      const linkedTypes = getDataTypesForDataset(id);
      if (dataset) {
        setFormData(dataset);
        setLinkedDataTypeIds(new Set(linkedTypes.map(lt => lt.id)));
      }
    }
  }, [id, isEditMode, getDatasetById, getDataTypesForDataset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({ 
        ...prev, 
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleLinkChange = (dataTypeId: string) => {
    setLinkedDataTypeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataTypeId)) {
        newSet.delete(dataTypeId);
      } else {
        newSet.add(dataTypeId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) {
      addNotification('Name and URL are required.', 'error');
      return;
    }
    if (linkedDataTypeIds.size === 0) {
      addNotification('At least one Data Type must be linked.', 'error');
      return;
    }

    try {
        if (isEditMode) {
            await updateDataset({
                dataset: formData as Dataset,
                linkedDataTypeIds: Array.from(linkedDataTypeIds) as any,
            });
            addNotification('Dataset updated successfully!', 'success');
            navigate({ name: 'dataset-detail', id });
        } else {
            await addDataset({
                dataset: formData,
                linkedDataTypeIds: Array.from(linkedDataTypeIds) as any,
            });
            addNotification('Dataset added successfully!', 'success');
            navigate({ name: 'datasets' });
        }
    } catch(error) {
        console.error("Failed to save dataset:", error);
        addNotification('Failed to save dataset.', 'error');
    }
  };

  const handleDelete = async () => {
    if (isEditMode && formData && window.confirm(`Are you sure you want to delete the dataset "${formData.name}"? This action cannot be undone.`)) {
        try {
            await deleteDataset(id);
            addNotification('Dataset deleted successfully!', 'success');
            navigate({ name: 'datasets' });
        } catch (error) {
            console.error("Failed to delete dataset:", error);
            addNotification('Failed to delete dataset.', 'error');
        }
    }
  }
  
  const FormRow: React.FC<{children: React.ReactNode, required?: boolean, label: string, htmlFor: string}> = ({children, required, label, htmlFor}) => (
      <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
      </div>
  )

  const backLink = isEditMode && id ? { name: 'dataset-detail', id: id } as Page : { name: 'datasets' } as Page;

  return (
    <div>
      <button onClick={() => navigate(backLink)} className="mb-4 text-button-blue hover:underline">
          &larr; Cancel and Back
      </button>
      <Card>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{isEditMode ? 'Edit Dataset' : 'Add New Dataset'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormRow label="Name" htmlFor="name" required>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </FormRow>
            <FormRow label="URL" htmlFor="url" required>
                <input type="url" id="url" name="url" value={formData.url} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </FormRow>
            <div className="md:col-span-2">
                <FormRow label="Description" htmlFor="description">
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </FormRow>
            </div>
            <FormRow label="Source Organization" htmlFor="source_organization">
                <input type="text" id="source_organization" name="source_organization" value={formData.source_organization} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </FormRow>
             <FormRow label="Format" htmlFor="format">
                <input type="text" id="format" name="format" value={formData.format} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="e.g., GeoJSON, Shapefile, CSV" />
            </FormRow>
            <FormRow label="Geographic Coverage" htmlFor="geographic_coverage">
                <input type="text" id="geographic_coverage" name="geographic_coverage" value={formData.geographic_coverage} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="e.g., Nairobi, Kenya" />
            </FormRow>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="is_primary_example" name="is_primary_example" type="checkbox" checked={formData.is_primary_example} onChange={handleChange} className="focus:ring-button-blue h-4 w-4 text-button-blue border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="is_primary_example" className="font-medium text-gray-700">Primary Example?</label>
                    <p className="text-gray-500">Is this the best example dataset for the linked types?</p>
                </div>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">
                Link to Data Types <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                    {dataTypes.map(dt => (
                        <div key={dt.id} className="relative flex items-start p-4">
                            <div className="min-w-0 flex-1 text-sm">
                                <label htmlFor={`link-${dt.id}`} className="font-medium text-gray-700 select-none">{dt.name} <span className="text-gray-500">({dt.uid})</span></label>
                            </div>
                            <div className="ml-3 flex items-center h-5">
                                <input id={`link-${dt.id}`} type="checkbox" checked={linkedDataTypeIds.has(dt.id)} onChange={() => handleLinkChange(dt.id)} className="focus:ring-button-blue h-4 w-4 text-button-blue border-gray-300 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-between items-center">
                <div>
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Delete Dataset
                        </button>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => navigate(backLink)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="bg-button-blue text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-600">{isEditMode ? 'Save Changes' : 'Save Dataset'}</button>
                </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DatasetForm;