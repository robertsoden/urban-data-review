import React from 'react';
import { useData } from '../context/DataContext';
import { Page, Dataset } from '../types';
import { Card } from '../components/Card';

interface DatasetsListProps {
  navigate: (page: Page) => void;
}

const DatasetsList: React.FC<DatasetsListProps> = ({ navigate }) => {
  const { datasets, getDataTypeCountForDataset } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-neutral-800">Datasets</h1>
        <button
          onClick={() => navigate({ name: 'dataset-add' })}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          Add New Dataset
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Format</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Coverage</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-center">Linked Types</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {datasets.map(ds => (
                <tr key={ds.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    <span
                      onClick={() => navigate({ name: 'dataset-detail', id: ds.id })}
                      className="text-primary-600 hover:text-primary-700 cursor-pointer font-semibold"
                    >
                      {ds.name}
                    </span>
                    {ds.is_primary_example && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Primary Example</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{ds.source_organization}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono bg-neutral-200 text-neutral-800 text-xs px-2 py-1 rounded">{ds.format}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{ds.geographic_coverage}</td>
                  <td className="px-4 py-3 text-center font-medium text-neutral-700">
                    {getDataTypeCountForDataset(ds.id)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={ds.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 hover:underline font-semibold whitespace-nowrap"
                    >
                      View Source &rarr;
                    </a>
                  </td>
                </tr>
              ))}
              {datasets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-500">
                    No datasets have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DatasetsList;