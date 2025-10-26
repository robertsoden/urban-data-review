import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType, Priority, CompletionStatus, RdlsStatus } from '../types';
import { Card } from '../components/Card';

interface DataTypeFormProps {
  navigate: (page: Page) => void;
  id?: string;
}

const DataTypeForm: React.FC<DataTypeFormProps> = ({ navigate, id }) => {
  const { datasets, categories, getDataTypeById, getDatasetsForDataType, addDataType, updateDataType, deleteDataType, addNotification } = useData();
  const isEditMode = id !== undefined;

  const [formData, setFormData] = useState<Omit<DataType, 'id' | 'created_at'> | DataType>({
    uid: '', name: '', category: categories[0]?.name || '', description: '',
    priority: Priority.Unassigned, completion_status: CompletionStatus.NotStarted,
    minimum_criteria: '', notes: '', key_attributes: '[]', applicable_standards: '',
    iso_indicators: '', rdls_can_handle: RdlsStatus.Unassigned,
    rdls_component: '', rdls_notes: ''
  });
  const [linkedDatasetIds, setLinkedDatasetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isEditMode) {
      const dataType = getDataTypeById(id);
      const linkedDatasets = getDatasetsForDataType(id);
      if (dataType) {
        setFormData(dataType);
        setLinkedDatasetIds(new Set(linkedDatasets.map(ds => ds.id)));
      }
    }
  }, [id, isEditMode, getDataTypeById, getDatasetsForDataType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLinkChange = (datasetId: string) => {
    setLinkedDatasetIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(datasetId)) {
        newSet.delete(datasetId);
      } else {
        newSet.add(datasetId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.uid) {
      addNotification('Name and UID are required.', 'error');
      return;
    }

    try {
        if (isEditMode) {
            await updateDataType({
                dataType: formData as DataType,
                linkedDatasetIds: Array.from(linkedDatasetIds) as any, // Cast for simplicity
            });
            addNotification('Data Type updated successfully!', 'success');
            navigate({ name: 'data-type-detail', id });
        } else {
            await addDataType({
                dataType: formData,
                linkedDatasetIds: Array.from(linkedDatasetIds) as any, // Cast for simplicity
            });
            addNotification('Data Type added successfully!', 'success');
            navigate({ name: 'data-types' });
        }
    } catch (error) {
        console.error("Failed to save data type:", error);
        addNotification('Failed to save data type.', 'error');
    }
  };
  
  const handleDelete = async () => {
    if (isEditMode && formData && window.confirm(`Are you sure you want to delete the data type "${formData.name}"? This action cannot be undone.`)) {
        try {
            await deleteDataType(id);
            addNotification('Data Type deleted successfully!', 'success');
            navigate({ name: 'data-types' });
        } catch (error) {
            console.error("Failed to delete data type:", error);
            addNotification('Failed to delete data type.', 'error');
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
  );

  const backLink = isEditMode && id ? { name: 'data-type-detail', id: id } as Page : { name: 'data-types' } as Page;

  return (
    <div>
      <button onClick={() => navigate(backLink)} className="mb-4 text-button-blue hover:underline">
          &larr; Cancel and Back
      </button>
      <Card>
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{isEditMode ? 'Edit Data Type' : 'Add New Data Type'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormRow label="Name" htmlFor="name" required>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </FormRow>
            <FormRow label="UID" htmlFor="uid" required>
                <input type="text" id="uid" name="uid" value={formData.uid} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="e.g., INF-001" />
            </FormRow>
             <FormRow label="Category" htmlFor="category">
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
            </FormRow>
             <div className="md:col-span-3">
                <FormRow label="Description" htmlFor="description">
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </FormRow>
            </div>
            <FormRow label="Priority" htmlFor="priority">
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </FormRow>
             <FormRow label="Completion Status" htmlFor="completion_status">
                <select id="completion_status" name="completion_status" value={formData.completion_status} onChange={handleChange} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    {Object.values(CompletionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </FormRow>
            <div className="md:col-span-3">
                <FormRow label="Key Attributes (JSON Array)" htmlFor="key_attributes">
                    <textarea id="key_attributes" name="key_attributes" value={formData.key_attributes} onChange={handleChange} rows={3} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md font-mono" />
                </FormRow>
            </div>
             <div className="md:col-span-3">
                <FormRow label="Notes" htmlFor="notes">
                    <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </FormRow>
            </div>
          </div>
          
           <div>
              <label className="block text-sm font-medium text-gray-700">Link to Datasets</label>
              <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                    {datasets.map(ds => (
                        <div key={ds.id} className="relative flex items-start p-4">
                            <div className="min-w-0 flex-1 text-sm">
                                <label htmlFor={`link-${ds.id}`} className="font-medium text-gray-700 select-none">{ds.name}</label>
                            </div>
                            <div className="ml-3 flex items-center h-5">
                                <input id={`link-${ds.id}`} type="checkbox" checked={linkedDatasetIds.has(ds.id)} onChange={() => handleLinkChange(ds.id)} className="focus:ring-button-blue h-4 w-4 text-button-blue border-gray-300 rounded" />
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
                            Delete Data Type
                        </button>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => navigate(backLink)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="bg-button-blue text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-600">{isEditMode ? 'Save Changes' : 'Save Data Type'}</button>
                </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DataTypeForm;