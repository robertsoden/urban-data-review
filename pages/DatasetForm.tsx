import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, Dataset } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

interface DatasetFormProps {
  navigate: (page: Page) => void;
  id?: string;
}

const FormRow: React.FC<{children: React.ReactNode, required?: boolean, label: string, htmlFor: string}> = ({children, required, label, htmlFor}) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
    </label>
    {children}
  </div>
);

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
        if (isEditMode && id) {
            await updateDataset(id, formData as Dataset, Array.from(linkedDataTypeIds));
            navigate({ name: 'dataset-detail', id });
        } else {
            await addDataset(formData, Array.from(linkedDataTypeIds));
            navigate({ name: 'datasets' });
        }
    } catch(error) {
        addNotification('Failed to save dataset.', 'error');
    }
  };

  const handleDelete = async () => {
    if (isEditMode && id && formData && window.confirm(`Are you sure you want to delete the dataset "${formData.name}"? This action cannot be undone.`)) {
        try {
            await deleteDataset(id);
            navigate({ name: 'datasets' });
        } catch (error) {
            addNotification('Failed to delete dataset.', 'error');
        }
    }
  }
  
  const inputClasses = "block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  const backLink = isEditMode && id ? { name: 'dataset-detail', id: id } as Page : { name: 'datasets' } as Page;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(backLink)}
        className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
      >
        &larr; Cancel and Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Dataset' : 'Add New Dataset'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormRow label="Name" htmlFor="name" required>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} />
            </FormRow>
            <FormRow label="URL" htmlFor="url" required>
                <input type="url" id="url" name="url" value={formData.url} onChange={handleChange} className={inputClasses} />
            </FormRow>
            <div className="md:col-span-2">
                <FormRow label="Description" htmlFor="description">
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClasses} />
                </FormRow>
            </div>
            <FormRow label="Source Organization" htmlFor="source_organization">
                <input type="text" id="source_organization" name="source_organization" value={formData.source_organization} onChange={handleChange} className={inputClasses} />
            </FormRow>
             <FormRow label="Format" htmlFor="format">
                <input type="text" id="format" name="format" value={formData.format} onChange={handleChange} className={inputClasses} placeholder="e.g., GeoJSON, Shapefile, CSV" />
            </FormRow>
            <FormRow label="Geographic Coverage" htmlFor="geographic_coverage">
                <input type="text" id="geographic_coverage" name="geographic_coverage" value={formData.geographic_coverage} onChange={handleChange} className={inputClasses} placeholder="e.g., Nairobi, Kenya" />
            </FormRow>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="is_primary_example" name="is_primary_example" type="checkbox" checked={formData.is_primary_example} onChange={handleChange} className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="is_primary_example" className="font-medium text-neutral-700">Primary Example?</label>
                    <p className="text-neutral-500">Is this the best example dataset for the linked types?</p>
                </div>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Link to Data Types <span className="text-red-600">*</span>
              </label>
              <div className="border border-neutral-300 rounded-lg max-h-60 overflow-y-auto">
                <div className="divide-y divide-neutral-200">
                    {dataTypes.map(dt => (
                        <div key={dt.id} className="relative flex items-start p-4 hover:bg-neutral-50 transition-colors">
                            <div className="min-w-0 flex-1 text-sm">
                                <label htmlFor={`link-${dt.id}`} className="font-medium text-neutral-700 select-none cursor-pointer">{dt.name}</label>
                            </div>
                            <div className="ml-3 flex items-center h-5">
                                <input id={`link-${dt.id}`} type="checkbox" checked={linkedDataTypeIds.has(dt.id)} onChange={() => handleLinkChange(dt.id)} className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          </div>

          <div className="pt-6 border-t border-neutral-200">
            <div className="flex justify-between items-center">
                <div>
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Delete Dataset
                        </button>
                    )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(backLink)}
                    className="bg-white py-2 px-4 border border-neutral-300 rounded-lg shadow-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white py-2 px-4 rounded-lg shadow-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    {isEditMode ? 'Save Changes' : 'Save Dataset'}
                  </button>
                </div>
            </div>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetForm;