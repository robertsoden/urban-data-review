import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import Card, { CardHeader } from '../components/Card';
import { CheckIcon, XIcon } from '../components/Icons';

interface DatasetDetailProps {
  navigate: (page: Page) => void;
  id: number;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
    <div className={fullWidth ? "col-span-1 sm:col-span-2" : ""}>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        <div className="mt-1 text-slate-900 prose prose-sm max-w-none">{children || <span className="text-slate-400 italic">Not specified</span>}</div>
    </div>
);

const BooleanDisplay: React.FC<{value: boolean}> = ({value}) => (
    <div className="flex items-center gap-2">
        {value ? <CheckIcon className="text-green-600" /> : <XIcon className="text-red-600" />}
        <span className="font-semibold">{value ? "Yes" : "No"}</span>
    </div>
)

const DatasetDetail: React.FC<DatasetDetailProps> = ({ navigate, id }) => {
  const { getDatasetById, getDataTypesForDataset } = useData();
  const dataset = getDatasetById(id);
  const linkedDataTypes = getDataTypesForDataset(id);

  if (!dataset) {
    return (
      <Card>
        <p className="text-red-500">Dataset not found.</p>
        <button onClick={() => navigate({ name: 'datasets' })} className="mt-4 text-button-blue hover:underline">
          &larr; Back to List
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate({ name: 'datasets' })} className="mb-4 text-button-blue hover:underline">
            &larr; Back to Datasets List
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{dataset.name}</h1>
            <a href={dataset.url} target="_blank" rel="noopener noreferrer" className="text-button-blue hover:underline break-all">{dataset.url}</a>
          </div>
          <button onClick={() => navigate({ name: 'dataset-edit', id: dataset.id })} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors shadow-sm whitespace-nowrap">
            Edit Dataset
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>Dataset Details</CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="Description" fullWidth>{dataset.description}</DetailItem>
            <DetailItem label="Source Organization">{dataset.source_organization}</DetailItem>
            <DetailItem label="Source Type">{dataset.source_type}</DetailItem>
            <DetailItem label="Format"><span className="font-mono bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded">{dataset.format}</span></DetailItem>
            <DetailItem label="Geographic Coverage">{dataset.geographic_coverage}</DetailItem>
            <DetailItem label="Temporal Coverage">{dataset.temporal_coverage}</DetailItem>
            <DetailItem label="Resolution">{dataset.resolution}</DetailItem>
            <DetailItem label="Access Type">{dataset.access_type}</DetailItem>
            <DetailItem label="License">{dataset.license}</DetailItem>
            <DetailItem label="Validated by Team"><BooleanDisplay value={dataset.is_validated} /></DetailItem>
            <DetailItem label="Primary Example"><BooleanDisplay value={dataset.is_primary_example} /></DetailItem>
        </div>
      </Card>

       <Card>
        <CardHeader>Notes & Context</CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Quality Notes" fullWidth>{dataset.quality_notes}</DetailItem>
            <DetailItem label="Used in Projects" fullWidth>{dataset.used_in_projects}</DetailItem>
             <DetailItem label="General Notes" fullWidth>{dataset.notes}</DetailItem>
        </div>
      </Card>

      <Card>
        <CardHeader>Linked Data Types ({linkedDataTypes.length})</CardHeader>
        {linkedDataTypes.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                     <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">UID</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {linkedDataTypes.map(dt => (
                            <tr key={dt.id} className="hover:bg-slate-50">
                                <td className="p-3 font-mono text-sm text-slate-500">{dt.uid}</td>
                                <td className="p-3">
                                    <span 
                                        onClick={() => navigate({ name: 'data-type-detail', id: dt.id })} 
                                        className="font-medium text-slate-900 cursor-pointer hover:text-button-blue"
                                    >
                                        {dt.name}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-600">{dt.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-slate-500 italic">This dataset has not been linked to any data types yet.</p>
        )}
      </Card>
    </div>
  );
};

export default DatasetDetail;