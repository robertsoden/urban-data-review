
import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card, CardHeader } from '../components/Card';
import { CompletionStatusBadge, PriorityBadge, RdlsStatusBadge } from '../components/Badge';

interface DataTypeDetailProps {
  navigate: (page: Page) => void;
  id: string;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
    <div className={fullWidth ? "col-span-1 sm:col-span-2" : ""}>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        <div className="mt-1 text-slate-900 prose prose-sm max-w-none">{children || <span className="text-slate-400 italic">Not specified</span>}</div>
    </div>
);

const DataTypeDetail: React.FC<DataTypeDetailProps> = ({ navigate, id }) => {
  const { getDataTypeById, getDatasetsForDataType } = useData();
  const dataType = getDataTypeById(id);
  const linkedDatasets = getDatasetsForDataType(id);

  if (!dataType) {
    return (
      <Card>
        <p className="text-red-500">Data Type not found.</p>
        <button onClick={() => navigate({ name: 'data-types' })} className="mt-4 text-button-blue hover:underline">
          &larr; Back to List
        </button>
      </Card>
    );
  }

  const renderJsonAttributes = (jsonString: string) => {
      try {
          const attributes = JSON.parse(jsonString);
          if (Array.isArray(attributes) && attributes.length > 0) {
              return (
                  <ul className="list-disc list-inside space-y-1">
                      {attributes.map((attr, index) => <li key={index}><code className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded">{attr}</code></li>)}
                  </ul>
              )
          }
      } catch (e) {
          // fall through to return original string if not valid json
      }
      return <p>{jsonString || <span className="text-slate-400 italic">Not specified</span>}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate({ name: 'data-types' })} className="mb-4 text-button-blue hover:underline">
            &larr; Back to Data Types List
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{dataType.name} <span className="font-mono text-xl text-slate-500 font-normal">({dataType.uid})</span></h1>
            <p className="mt-1 text-slate-600">{dataType.category}</p>
          </div>
          <button onClick={() => navigate({ name: 'data-type-edit', id: dataType.id })} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors shadow-sm whitespace-nowrap">
            Edit Data Type
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>Core Information</CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="Description" fullWidth>{dataType.description}</DetailItem>
            <DetailItem label="Priority"><PriorityBadge priority={dataType.priority} /></DetailItem>
            <DetailItem label="Completion Status"><CompletionStatusBadge status={dataType.completion_status} /></DetailItem>
            <DetailItem label="Minimum Criteria" fullWidth>{dataType.minimum_criteria}</DetailItem>
             <DetailItem label="General Notes" fullWidth>{dataType.notes}</DetailItem>
        </div>
      </Card>
      
       <Card>
        <CardHeader>Technical Details</CardHeader>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="Key Attributes">
                {renderJsonAttributes(dataType.key_attributes)}
            </DetailItem>
            <DetailItem label="Applicable Standards">{dataType.applicable_standards}</DetailItem>
            <DetailItem label="ISO Indicators">{dataType.iso_indicators}</DetailItem>
        </div>
      </Card>

      <Card>
        <CardHeader>RDLS Integration</CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="Can be handled by RDLS?"><RdlsStatusBadge status={dataType.rdls_can_handle} /></DetailItem>
            <DetailItem label="RDLS Component">{dataType.rdls_component}</DetailItem>
            <DetailItem label="RDLS Notes" fullWidth>{dataType.rdls_notes}</DetailItem>
        </div>
      </Card>

      <Card>
        <CardHeader>Linked Datasets ({linkedDatasets.length})</CardHeader>
        {linkedDatasets.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                     <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Source</th>
                            <th className="p-3">Format</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {linkedDatasets.map(ds => (
                            <tr key={ds.id} className="hover:bg-slate-50">
                                <td className="p-3">
                                    <span 
                                        onClick={() => navigate({ name: 'dataset-detail', id: ds.id })} 
                                        className="font-medium text-slate-900 cursor-pointer hover:text-button-blue"
                                    >
                                        {ds.name}
                                    </span>
                                     {ds.is_primary_example && (
                                        <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Primary Example</span>
                                    )}
                                </td>
                                <td className="p-3 text-slate-600">{ds.source_organization}</td>
                                <td className="p-3">
                                    <span className="font-mono bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded">{ds.format}</span>
                                </td>
                                <td className="p-3 text-right">
                                    <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-button-blue hover:underline font-semibold whitespace-nowrap">View Source &rarr;</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-slate-500 italic">This data type has not been linked to any datasets yet.</p>
        )}
      </Card>

    </div>
  );
};

export default DataTypeDetail;