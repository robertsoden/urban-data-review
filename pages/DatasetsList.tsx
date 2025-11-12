import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card, CardContent } from '../components/Card';

interface DatasetsListProps {
  navigate: (page: Page) => void;
}

const DatasetsList: React.FC<DatasetsListProps> = ({ navigate }) => {
  const { datasets, dataTypes, categories, getDataTypesForDataset } = useData();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDatasets = useMemo(() => {
    return datasets.filter(ds => {
      // Get linked data types for this dataset
      const linkedDataTypes = getDataTypesForDataset(ds.id);

      // Category filter - check if any linked data type matches the category
      const categoryMatch = categoryFilter === 'All' ||
        linkedDataTypes.some(dt => dt.category === categoryFilter);

      // Data type filter - check if the specific data type is linked
      const dataTypeMatch = dataTypeFilter === 'All' ||
        linkedDataTypes.some(dt => dt.id === dataTypeFilter);

      // Search filter
      const searchMatch = searchTerm === '' ||
        ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.source_organization.toLowerCase().includes(searchTerm.toLowerCase());

      return categoryMatch && dataTypeMatch && searchMatch;
    });
  }, [datasets, categoryFilter, dataTypeFilter, searchTerm, getDataTypesForDataset]);

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
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="datatype-filter" className="block text-sm font-medium text-neutral-700 mb-1">Data Type</label>
              <select
                id="datatype-filter"
                value={dataTypeFilter}
                onChange={e => setDataTypeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="All">All Data Types</option>
                {dataTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="search-filter" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <input
                id="search-filter"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="by name or source..."
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 font-semibold text-neutral-600 uppercase tracking-wider">Source Organization</th>
                <th className="px-4 py-3 font-semibold text-neutral-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 font-semibold text-neutral-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredDatasets.map(ds => (
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
                    {ds.is_validated && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Validated</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{ds.source_organization}</td>
                  <td className="px-4 py-3 text-neutral-600">{ds.source_type}</td>
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
              {filteredDatasets.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-neutral-500">
                    No datasets match the current filters.
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
