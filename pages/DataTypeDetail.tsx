import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import Card, { CardHeader } from '../components/Card';

interface DataTypeDetailProps {
  id: string;
  navigate: (page: Page) => void;
}

const DataTypeDetail: React.FC<DataTypeDetailProps> = ({ id, navigate }) => {
  const { getters } = useData();
  const dataType = getters.getDataTypeById(id);
  const linkedDatasets = getters.getDatasetsForDataType(id);

  if (!dataType) {
    return <div>Data Type not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{dataType.name}</h1>
          <p className="text-sm text-slate-500 mt-1">UID: {dataType.uid}</p>
        </div>
        <button 
            className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
            onClick={() => navigate({ name: 'dataTypeForm', id })}
        >
            Edit Data Type
        </button>
      </div>

      <Card>
        <CardHeader>Description</CardHeader>
        <p className="text-slate-700">{dataType.description || "No description provided."}</p>
      </Card>

      <Card>
        <CardHeader>Details</CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-slate-800">Category</p>
            <p className="text-slate-600">{dataType.category}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Data Format</p>
            <p className="text-slate-600">{dataType.data_format}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Update Frequency</p>
            <p className="text-slate-600">{dataType.update_frequency}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Data Source</p>
            <p className="text-slate-600">{dataType.data_source || 'N/A'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>Linked Datasets ({linkedDatasets.length})</CardHeader>
        {linkedDatasets.length > 0 ? (
          <ul className="space-y-2">
            {linkedDatasets.map(dataset => (
              <li 
                key={dataset.id} 
                className="p-3 bg-slate-50 rounded-md hover:bg-slate-100 cursor-pointer"
                onClick={() => navigate({ name: 'datasetDetail', id: dataset.id })}
              >
                <p className="font-bold text-slate-800">{dataset.name}</p>
                <p className="text-sm text-slate-600">{dataset.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">This data type is not linked to any datasets.</p>
        )}
      </Card>

      <Card>
        <CardHeader>Technical Details & Notes</CardHeader>
        <div className="prose max-w-none text-slate-700">
          <p><strong>Collection/Storage Details:</strong> {dataType.collection_storage_details || "N/A"}</p>
          <p><strong>Security/Privacy Notes:</strong> {dataType.security_privacy_notes || "N/A"}</p>
          <p><strong>API Details:</strong> {dataType.api_details || "N/A"}</p>
        </div>
      </Card>
    </div>
  );
};

export default DataTypeDetail;
