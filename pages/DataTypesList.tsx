import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType } from '../types';
import { Card, CardContent } from '../components/Card';

interface DataTypesListProps {
  navigate: (page: Page) => void;
  initialTheme?: string;
}

type SortColumn = 'name' | 'inspire_theme' | 'rdls_coverage';
type SortDirection = 'asc' | 'desc';

const SortIcon: React.FC<{ column: SortColumn; currentSort: SortColumn; direction: SortDirection }> = ({ column, currentSort, direction }) => {
  if (column !== currentSort) {
    return <span className="ml-1 text-neutral-300">↕</span>;
  }
  return <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>;
};

const DataTypesList: React.FC<DataTypesListProps> = ({ navigate, initialTheme }) => {
  const { dataTypes, inspireThemes } = useData();

  const [themeFilter, setThemeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    setThemeFilter(initialTheme || 'All');
  }, [initialTheme]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedDataTypes = useMemo(() => {
    const filtered = dataTypes.filter(dt => {
      const themeMatch = themeFilter === 'All' || dt.inspire_theme === themeFilter;
      const searchMatch = searchTerm === '' || dt.name.toLowerCase().includes(searchTerm.toLowerCase());
      return themeMatch && searchMatch;
    });

    return [...filtered].sort((a, b) => {
      const aVal = (a[sortColumn] || '').toLowerCase();
      const bVal = (b[sortColumn] || '').toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dataTypes, themeFilter, searchTerm, sortColumn, sortDirection]);

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
              <label htmlFor="theme-filter" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select
                id="theme-filter"
                value={themeFilter}
                onChange={e => setThemeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="All">All Categories</option>
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
                <th
                  className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 select-none"
                  onClick={() => handleSort('name')}
                >
                  Name<SortIcon column="name" currentSort={sortColumn} direction={sortDirection} />
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 select-none"
                  onClick={() => handleSort('inspire_theme')}
                >
                  Category<SortIcon column="inspire_theme" currentSort={sortColumn} direction={sortDirection} />
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 select-none"
                  onClick={() => handleSort('rdls_coverage')}
                >
                  RDLS Status<SortIcon column="rdls_coverage" currentSort={sortColumn} direction={sortDirection} />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredAndSortedDataTypes.map(dt => (
                <tr
                  key={dt.id}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
                >
                  <td className="px-4 py-3 font-medium text-neutral-900 hover:text-primary-600 transition-colors">{dt.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{dt.inspire_theme}</td>
                  <td className="px-4 py-3 text-neutral-600">{dt.rdls_coverage || <span className="text-neutral-400 italic">Not specified</span>}</td>
                </tr>
              ))}
              {filteredAndSortedDataTypes.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-neutral-500">
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
