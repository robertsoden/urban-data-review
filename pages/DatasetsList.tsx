import React from 'react';
import { useData } from '../context/DataContext';
import { Page, Dataset } from '../types';
import Card from '../components/Card';

interface DatasetsListProps {
  navigate: (page: Page) => void;
}

const DatasetsList: React.FC<DatasetsListProps> = ({ navigate }) => {
  const { datasets, getDataTypeCountForDataset } = useData();

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Datasets</h1>
        <button onClick={() => navigate({ name: 'dataset-add' })} className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm">
          Add New Dataset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Source</th>
              <th className="p-3">Format</th>
              <th className="p-3">Coverage</th>
              <th className="p-3 text-center">Linked Types</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {datasets.map(ds => (
              <tr key={ds.id} className="hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-900">
                   <span onClick={() => navigate({ name: 'dataset-detail', id: ds.id })} className="text-header-blue hover:text-button-blue cursor-pointer font-semibold">
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
                <td className="p-3 text-slate-600">{ds.geographic_coverage}</td>
                <td className="p-3 text-center font-medium text-slate-700">
                  {getDataTypeCountForDataset(ds.id)}
                </td>
                 <td className="p-3 text-right">
                    <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-button-blue hover:underline font-semibold whitespace-nowrap">View Source &rarr;</a>
                </td>
              </tr>
            ))}
            {datasets.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center p-8 text-slate-500">
                        No datasets have been added yet.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DatasetsList;