import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';

interface DataTypeFormProps {
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

const DataTypeForm: React.FC<DataTypeFormProps> = ({ navigate, id }) => {
  const { datasets, inspireThemes, getDataTypeById, getDatasetsForDataType, addDataType, updateDataType, deleteDataType, addNotification } = useData();
  const isEditMode = id !== undefined;

  const [formData, setFormData] = useState<Omit<DataType, 'id' | 'created_at'> | DataType>({
    name: '',
    inspire_theme: inspireThemes[0]?.name || '',
    inspire_annex: 'Annex III',
    inspire_spec: '',
    description: '',
    applicable_standards: '',
    minimum_criteria: '',
    rdls_coverage: '',
    rdls_extension_module: ''
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
    if (!formData.name || !formData.name.trim()) {
      addNotification('Name is required.', 'error');
      return;
    }

    try {
        if (isEditMode) {
            await updateDataType(id, formData as DataType, Array.from(linkedDatasetIds));
            navigate({ name: 'data-type-detail', id });
        } else {
            await addDataType(formData, Array.from(linkedDatasetIds));
            navigate({ name: 'data-types' });
        }
    } catch (error) {
        console.error("Failed to save data type:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save data type.';
        addNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !formData) return;

    const linkedDatasetsCount = linkedDatasetIds.size;
    const message = linkedDatasetsCount > 0
      ? `Are you sure you want to delete "${formData.name}"?\n\n${linkedDatasetsCount} dataset link(s) will also be removed.\n\nThis action cannot be undone.`
      : `Are you sure you want to delete "${formData.name}"?\n\nThis action cannot be undone.`;

    if (window.confirm(message)) {
        try {
            await deleteDataType(id);
            navigate({ name: 'data-types' });
        } catch (error) {
            console.error("Failed to delete data type:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete data type.';
            addNotification(errorMessage, 'error');
        }
    }
  }

  const inputClasses = "block w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  const backLink = isEditMode && id ? { name: 'data-type-detail', id: id } as Page : { name: 'data-types' } as Page;

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
          <CardTitle>{isEditMode ? 'Edit Data Type' : 'Add New Data Type'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <FormRow label="Name" htmlFor="name" required>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} />
                </FormRow>
              </div>
              <FormRow label="Category" htmlFor="inspire_theme">
                <select id="inspire_theme" name="inspire_theme" value={formData.inspire_theme} onChange={handleChange} className={inputClasses}>
                  {inspireThemes.map(theme => <option key={theme.id} value={theme.name}>{theme.name}</option>)}
                </select>
              </FormRow>
              <FormRow label="INSPIRE Annex" htmlFor="inspire_annex">
                <select id="inspire_annex" name="inspire_annex" value={formData.inspire_annex} onChange={handleChange} className={inputClasses}>
                  <option value="Annex I">Annex I</option>
                  <option value="Annex II">Annex II</option>
                  <option value="Annex III">Annex III</option>
                </select>
              </FormRow>
              <div className="md:col-span-2">
                <FormRow label="INSPIRE Specification" htmlFor="inspire_spec">
                    <input type="text" id="inspire_spec" name="inspire_spec" value={formData.inspire_spec} onChange={handleChange} className={inputClasses} placeholder="e.g., D2.8.III.2 Buildings v3.0" />
                </FormRow>
              </div>
              <div className="md:col-span-3">
                <FormRow label="Description" htmlFor="description">
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClasses} />
                </FormRow>
              </div>
              <div className="md:col-span-3">
                <FormRow label="Applicable Standards" htmlFor="applicable_standards">
                    <input type="text" id="applicable_standards" name="applicable_standards" value={formData.applicable_standards} onChange={handleChange} className={inputClasses} />
                </FormRow>
              </div>
              <div className="md:col-span-3">
                <FormRow label="Minimum Criteria" htmlFor="minimum_criteria">
                    <textarea id="minimum_criteria" name="minimum_criteria" value={formData.minimum_criteria} onChange={handleChange} rows={2} className={inputClasses} />
                </FormRow>
              </div>
              <FormRow label="RDLS Coverage" htmlFor="rdls_coverage">
                  <input type="text" id="rdls_coverage" name="rdls_coverage" value={formData.rdls_coverage} onChange={handleChange} className={inputClasses} />
              </FormRow>
              <div className="md:col-span-2">
                <FormRow label="RDLS Extension Module" htmlFor="rdls_extension_module">
                    <input type="text" id="rdls_extension_module" name="rdls_extension_module" value={formData.rdls_extension_module} onChange={handleChange} className={inputClasses} />
                </FormRow>
              </div>
            </div>

             <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Link to Datasets</label>
                <div className="border border-neutral-300 rounded-lg max-h-60 overflow-y-auto">
                  <div className="divide-y divide-neutral-200">
                      {datasets.length > 0 ? datasets.map(ds => (
                          <div key={ds.id} className="relative flex items-start p-4 hover:bg-neutral-50 transition-colors">
                              <div className="min-w-0 flex-1 text-sm">
                                  <label htmlFor={`link-${ds.id}`} className="font-medium text-neutral-700 select-none cursor-pointer">{ds.name}</label>
                              </div>
                              <div className="ml-3 flex items-center h-5">
                                  <input
                                    id={`link-${ds.id}`}
                                    type="checkbox"
                                    checked={linkedDatasetIds.has(ds.id)}
                                    onChange={() => handleLinkChange(ds.id)}
                                    className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                                  />
                              </div>
                          </div>
                      )) : (
                        <p className="p-4 text-neutral-500 italic">No datasets available. Add datasets first to link them.</p>
                      )}
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
                              Delete Data Type
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
                      {isEditMode ? 'Save Changes' : 'Save Data Type'}
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

export default DataTypeForm;
