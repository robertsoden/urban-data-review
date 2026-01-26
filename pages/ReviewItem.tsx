import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType } from '../types';

interface ReviewItemProps {
  navigate: (page: Page) => void;
  index: number;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ navigate, index }) => {
  const { dataTypes, updateDataType, deleteDataType } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DataType>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dataType = dataTypes[index];
  const totalCount = dataTypes.length;

  useEffect(() => {
    if (dataType) {
      setFormData({ ...dataType });
    }
  }, [index]);

  if (!dataType) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-neutral-600">Data type not found</p>
        <button
          onClick={() => navigate({ name: 'review' })}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to list
        </button>
      </div>
    );
  }

  const handleChange = (field: keyof DataType, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateDataType(dataType.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...dataType });
    setIsEditing(false);
  };

  const handleNext = () => {
    if (index < totalCount - 1) {
      navigate({ name: 'review-item', index: index + 1 });
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      navigate({ name: 'review-item', index: index - 1 });
    }
  };

  const handleSaveAndNext = () => {
    updateDataType(dataType.id, formData);
    setIsEditing(false);
    handleNext();
  };

  const handleDelete = () => {
    deleteDataType(dataType.id);
    navigate({ name: 'review' });
  };

  const rdlsCoverageOptions = ['Covered', 'Extension', 'Partial'];
  const rdlsComponentOptions = [...new Set(dataTypes.map(dt => dt.rdls_component).filter(Boolean))].sort();
  const themeOptions = [...new Set(dataTypes.map(dt => dt.category).filter(Boolean))].sort();

  const renderField = (label: string, field: keyof DataType, multiline = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-500 mb-1">{label}</label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={(formData[field] as string) || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={(formData[field] as string) || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      ) : (
        <div className="text-neutral-900">
          {field === 'example_url' && formData[field] ? (
            <a href={formData[field] as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {formData[field] as string}
            </a>
          ) : (
            (formData[field] as string) || <span className="text-neutral-400 italic">Not specified</span>
          )}
        </div>
      )}
    </div>
  );

  const renderSelect = (label: string, field: keyof DataType, options: string[]) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-neutral-500 mb-1">{label}</label>
      {isEditing ? (
        <select
          value={(formData[field] as string) || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <div className="text-neutral-900">
          {(formData[field] as string) || <span className="text-neutral-400 italic">Not specified</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate({ name: 'review' })}
          className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to list
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            {index + 1} of {totalCount}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              className="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={index === totalCount - 1}
              className="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="text-2xl font-bold text-neutral-900 mb-2 w-full border border-neutral-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">{formData.name}</h1>
            )}
            <div className="flex gap-2">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                formData.rdls_coverage === 'Covered' ? 'bg-green-100 text-green-800' :
                formData.rdls_coverage === 'Extension' ? 'bg-yellow-100 text-yellow-800' :
                formData.rdls_coverage === 'Partial' ? 'bg-orange-100 text-orange-800' :
                'bg-neutral-100 text-neutral-600'
              }`}>
                {formData.rdls_coverage || 'N/A'}
              </span>
              {formData.rdls_component && (
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {formData.rdls_component}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded font-medium text-sm border border-neutral-300 hover:bg-neutral-50"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {renderField('Description', 'description', true)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {renderSelect('Category', 'category', themeOptions)}
          {renderField('INSPIRE Spec', 'inspire_spec')}
          {renderSelect('RDLS Coverage', 'rdls_coverage', rdlsCoverageOptions)}
          {renderSelect('RDLS Component', 'rdls_component', rdlsComponentOptions)}
          {renderField('Example Dataset', 'example_dataset')}
          {renderField('Example URL', 'example_url')}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          {renderField('Requirements', 'requirements', true)}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutral-200">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="border border-neutral-300 px-4 py-2 rounded font-medium text-sm hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700"
              >
                Save
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 px-4 py-2 rounded font-medium text-sm hover:bg-red-50"
            >
              Delete
            </button>
          </div>
          {index < totalCount - 1 && (
            <button
              onClick={handleSaveAndNext}
              className="bg-neutral-800 text-white px-4 py-2 rounded font-medium text-sm hover:bg-neutral-700"
            >
              Save & Next
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Delete Data Type?</h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to delete "{formData.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-neutral-300 rounded font-medium text-sm hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
