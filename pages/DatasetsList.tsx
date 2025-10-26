import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import Card, { CardHeader } from '../components/Card';

interface DatasetsListProps {
  navigate: (page: Page) => void;
}

const DatasetsList: React.FC<DatasetsListProps> = ({ navigate }) => {
  const { state, getters } = useData();
  const { datasets } = state;
  const { getDataTypeCountForDataset } = getters;

  return (
    <Card>
      <CardHeader>Datasets</CardHeader>
      <div className="space-y-2">
        {datasets.map(dataset => (
          <div key={dataset.id} className="p-2 border rounded-md cursor-pointer hover:bg-slate-50" onClick={() => navigate({ name: 'datasetDetail', id: dataset.id })}>
            <h3 className="font-bold">{dataset.name}</h3>
            <p className="text-sm text-slate-600">Data Types: {getDataTypeCountForDataset(dataset.id)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DatasetsList;