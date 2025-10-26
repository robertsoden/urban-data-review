import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import Card, { CardHeader } from '../components/Card';

interface DatasetDetailProps {
  id: string;
  navigate: (page: Page) => void;
}

const DatasetDetail: React.FC<DatasetDetailProps> = ({ id, navigate }) => {
  const { getters } = useData();
  const dataset = getters.getDatasetById(id);
  const linkedDataTypes = getters.getDataTypesForDataset(id);

  if (!dataset) {
    return <div>Dataset not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-slate-800">{dataset.name}</h1>
        <button 
            className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
            onClick={() => navigate({ name: 'datasetForm', id })}
        >
            Edit Dataset
        </button>
      </div>

      <Card>
        <CardHeader>Description</CardHeader>
        <p className="text-slate-700">{dataset.description || "No description provided."}</p>
      </Card>

      <Card>
        <CardHeader>Linked Data Types ({linkedDataTypes.length})</CardHeader>
        {linkedDataTypes.length > 0 ? (
          <ul className="space-y-2">
            {linkedDataTypes.map(dataType => (
              <li 
                key={dataType.id} 
                className="p-3 bg-slate-50 rounded-md hover:bg-slate-100 cursor-pointer"
                onClick={() => navigate({ name: 'dataTypeDetail', id: dataType.id })}
              >
                <p className="font-bold text-slate-800">{dataType.name}</p>
                <p className="text-sm text-slate-600">{dataType.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">This dataset is not linked to any data types.</p>
        )}
      </Card>
    </div>
  );
};

export default DatasetDetail;
