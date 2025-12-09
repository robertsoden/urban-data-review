import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType } from '../types';
import { Card, CardContent } from '../components/Card';
import { CompletionStatusBadge, RdlsStatusBadge } from '../components/Badge';
import { useSort } from '../hooks/useSort';
import { ArrowUpIcon, ArrowDownIcon } from '../components/Icons';

interface DataTypesListProps {
  navigate: (page: Page) => void;
  initialTheme?: string;
  showProgress?: boolean;
}

const DataTypesList: React.FC<DataTypesListProps> = ({ navigate, initialTheme, showProgress }) => {
  const { dataTypes, inspireThemes } = useData();

  const [themeFilter, setThemeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setThemeFilter(initialTheme || 'All');
  }, [initialTheme]);

  const filteredDataTypes = useMemo(() => {
    return dataTypes.filter(dt => {
      const themeMatch = themeFilter === 'All' || dt.inspire_theme === themeFilter;
      const searchMatch = searchTerm === '' || dt.name.toLowerCase().includes(searchTerm.toLowerCase());
      return themeMatch && searchMatch;
    });
  }, [dataTypes, themeFilter, searchTerm]);

  const { sortedData, handleSort, sortColumn, sortDirection } = useSort<DataType>(filteredDataTypes, 'name');

  const SortableHeader: React.FC<{ column: keyof DataType; children: React.ReactNode }> = ({ column, children }) => (
    <th
      className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        {children}
        {sortColumn === column && (
          sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />
        )}
      </div>
    </th>
  );

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="theme-filter" className="block text-sm font-medium text-neutral-700 mb-1">INSPIRE Theme</label>
              <select
                id="theme-filter"
                value={themeFilter}
                onChange={e => setThemeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="All">All Themes</option>
                {inspireThemes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="search-filter" className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
              <input
                id="search-filter"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="by name..."
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
                <SortableHeader column="name">Name</SortableHeader>
                <SortableHeader column="category">Category</SortableHeader>
                <SortableHeader column="rdls_can_handle">Can be handled by RDLS?</SortableHeader>
                {showProgress && <SortableHeader column="completion_status">Status</SortableHeader>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {sortedData.map(dt => (
                <tr
                  key={dt.id}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
                >
                  <td className="px-4 py-3 font-medium text-neutral-900 hover:text-primary-600 transition-colors">{dt.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{dt.category}</td>
                  <td className="px-4 py-3"><RdlsStatusBadge status={dt.rdls_can_handle} /></td>
                  {showProgress && <td className="px-4 py-3"><CompletionStatusBadge status={dt.completion_status} /></td>}
                </tr>
              ))}
              {sortedData.length === 0 && (
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