import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType, CompletionStatus } from '../types';
import { Card, CardContent } from '../components/Card';
import { CompletionStatusBadge, PriorityBadge } from '../components/Badge';

interface DataTypesListProps {
  navigate: (page: Page) => void;
  initialCategory?: string;
  initialStatus?: CompletionStatus;
}

const DataTypesList: React.FC<DataTypesListProps> = ({ navigate, initialCategory, initialStatus }) => {
  const { dataTypes, categories } = useData();
  const showProgress = import.meta.env.VITE_SHOW_PROGRESS === 'true';

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCategoryFilter(initialCategory || 'All');
  }, [initialCategory]);

  useEffect(() => {
    setStatusFilter(initialStatus || 'All');
  }, [initialStatus]);

  const filteredDataTypes = useMemo(() => {
    return dataTypes.filter(dt => {
      const categoryMatch = categoryFilter === 'All' || dt.category === categoryFilter;
      const statusMatch = statusFilter === 'All' || dt.completion_status === statusFilter;
      const searchMatch = searchTerm === '' || dt.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [dataTypes, categoryFilter, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-neutral-800">Data Types</h1>
        <button
          onClick={() => navigate({ name: 'data-type-add' })}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          Add New Data Type
        </button>
      </div>

      <Card>
        <CardContent>
          <div className={`grid grid-cols-1 gap-4 ${showProgress ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
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
            {showProgress && (
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="All">All Statuses</option>
                  {Object.values(CompletionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="search-filter" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <input
                id="search-filter"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="by name or UID..."
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
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Priority</th>
                {showProgress && <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredDataTypes.map(dt => (
                <tr
                  key={dt.id}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
                >
                  <td className="px-4 py-3 font-medium text-neutral-900 hover:text-primary-600 transition-colors">{dt.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{dt.category}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={dt.priority} /></td>
                  {showProgress && <td className="px-4 py-3"><CompletionStatusBadge status={dt.completion_status} /></td>}
                </tr>
              ))}
              {filteredDataTypes.length === 0 && (
                <tr>
                  <td colSpan={showProgress ? 4 : 3} className="text-center py-12 text-neutral-500">
                    No data types match the current filters.
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

export default DataTypesList;