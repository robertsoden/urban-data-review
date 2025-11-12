import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { CheckIcon, XIcon, ArrowLeftIcon, PencilIcon } from '../components/Icons';

interface DatasetDetailProps {
  navigate: (page: Page) => void;
  id: string;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-1 sm:col-span-2" : ""}>
    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{label}</h3>
    <div className="mt-1 text-neutral-900 prose prose-sm max-w-none">{children || <span className="text-neutral-400 italic">Not specified</span>}</div>
  </div>
);

const BooleanDisplay: React.FC<{ value: boolean }> = ({ value }) => (
  <div className="flex items-center gap-2">
    {value ? <CheckIcon className="text-success" /> : <XIcon className="text-neutral-400" />}
    <span className="font-semibold text-neutral-700">{value ? 'Yes' : 'No'}</span>
  </div>
);

const DatasetDetail: React.FC<DatasetDetailProps> = ({ navigate, id }) => {
  const { getDatasetById, getDataTypesForDataset } = useData();
  const dataset = getDatasetById(id);
  const linkedDataTypes = getDataTypesForDataset(id);

  if (!dataset) {
    return (
      <Card>
        <CardContent>
          <p className="text-danger">Dataset not found.</p>
          <button onClick={() => navigate({ name: 'datasets' })} className="mt-4 text-primary-600 hover:underline flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to List
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate({ name: 'datasets' })} className="mb-4 text-primary-600 hover:underline flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Datasets List
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-neutral-800">{dataset.name}</h1>
            <a href={dataset.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">{dataset.url}</a>
          </div>
          <button 
            onClick={() => navigate({ name: 'dataset-edit', id: dataset.id })}
            className="bg-warning text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Dataset
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dataset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="Description" fullWidth>{dataset.description}</DetailItem>
            <DetailItem label="Source Organization">{dataset.source_organization}</DetailItem>
            <DetailItem label="Source Type">{dataset.source_type}</DetailItem>
            <DetailItem label="Format"><span className="font-mono bg-neutral-200 text-neutral-800 text-xs px-2 py-1 rounded">{dataset.format}</span></DetailItem>
            <DetailItem label="Geographic Coverage">{dataset.geographic_coverage}</DetailItem>
            <DetailItem label="Temporal Coverage">{dataset.temporal_coverage}</DetailItem>
            <DetailItem label="Resolution">{dataset.resolution}</DetailItem>
            <DetailItem label="Access Type">{dataset.access_type}</DetailItem>
            <DetailItem label="License">{dataset.license}</DetailItem>
            <DetailItem label="Validated by Team"><BooleanDisplay value={dataset.is_validated} /></DetailItem>
            <DetailItem label="Primary Example"><BooleanDisplay value={dataset.is_primary_example} /></DetailItem>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Notes & Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem label="Quality Notes" fullWidth>{dataset.quality_notes}</DetailItem>
              <DetailItem label="Used in Projects" fullWidth>{dataset.used_in_projects}</DetailItem>
              <DetailItem label="General Notes" fullWidth>{dataset.notes}</DetailItem>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Data Types ({linkedDataTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {linkedDataTypes.length > 0 ? (
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-neutral-100 text-xs text-neutral-500 uppercase tracking-wider">
                          <tr>
                              <th className="p-3">Name</th>
                              <th className="p-3">Category</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                          {linkedDataTypes.map(dt => (
                              <tr key={dt.id} className="hover:bg-neutral-50">
                                  <td className="p-3">
                                      <span
                                          onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
                                          className="font-medium text-neutral-900 cursor-pointer hover:text-primary-600"
                                      >
                                          {dt.name}
                                      </span>
                                  </td>
                                  <td className="p-3 text-neutral-600">{dt.category}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          ) : (
              <p className="text-neutral-500 italic">This dataset has not been linked to any data types yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetDetail;
