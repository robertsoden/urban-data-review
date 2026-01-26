import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType } from '../types';

interface ReviewProps {
  navigate: (page: Page) => void;
}

type SortField = 'name' | 'category' | 'rdls_coverage' | 'rdls_component' | 'example';
type SortDirection = 'asc' | 'desc';

const Review: React.FC<ReviewProps> = ({ navigate }) => {
  const { dataTypes, exportData } = useData();
  const [filterTheme, setFilterTheme] = useState<string>('');
  const [filterCoverage, setFilterCoverage] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const themes = [...new Set(dataTypes.map(dt => dt.category))].sort();
  const coverages = [...new Set(dataTypes.map(dt => dt.rdls_coverage))].filter(Boolean).sort();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (
        sortDirection === 'asc' ? '↑' : '↓'
      ) : (
        <span className="text-neutral-300">↕</span>
      )}
    </span>
  );

  const filteredAndSortedDataTypes = useMemo(() => {
    let result = dataTypes.filter(dt => {
      if (filterTheme && dt.category !== filterTheme) return false;
      if (filterCoverage && dt.rdls_coverage !== filterCoverage) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let aVal: string | boolean;
      let bVal: string | boolean;

      switch (sortField) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'rdls_coverage':
          aVal = (a.rdls_coverage || '').toLowerCase();
          bVal = (b.rdls_coverage || '').toLowerCase();
          break;
        case 'rdls_component':
          aVal = (a.rdls_component || '').toLowerCase();
          bVal = (b.rdls_component || '').toLowerCase();
          break;
        case 'example':
          aVal = !!(a.example_dataset && a.example_url);
          bVal = !!(b.example_dataset && b.example_url);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [dataTypes, filterTheme, filterCoverage, sortField, sortDirection]);

  const totalCount = dataTypes.length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Urban Data Catalog</h1>
        <p className="text-neutral-600">
          {totalCount} data types
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="border border-neutral-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All categories</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">RDLS Coverage</label>
            <select
              value={filterCoverage}
              onChange={(e) => setFilterCoverage(e.target.value)}
              className="border border-neutral-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="">All</option>
              {coverages.map(cov => (
                <option key={cov} value={cov}>{cov}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto mt-5 flex gap-2">
            <button
              onClick={() => exportData('csv')}
              className="bg-neutral-800 text-white px-4 py-1.5 rounded text-sm hover:bg-neutral-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportData('json')}
              className="border border-neutral-300 px-4 py-1.5 rounded text-sm hover:bg-neutral-50"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('name')}
              >
                Data Type<SortIcon field="name" />
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('category')}
              >
                Category<SortIcon field="category" />
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('rdls_coverage')}
              >
                RDLS<SortIcon field="rdls_coverage" />
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('rdls_component')}
              >
                Component<SortIcon field="rdls_component" />
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 whitespace-nowrap"
                onClick={() => handleSort('example')}
              >
                Example<SortIcon field="example" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDataTypes.map((dt) => {
              const originalIndex = dataTypes.findIndex(d => d.id === dt.id);
              return (
                <tr
                  key={dt.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                  onClick={() => navigate({ name: 'review-item', index: originalIndex })}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{dt.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{dt.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      dt.rdls_coverage === 'Covered' ? 'bg-green-100 text-green-800' :
                      dt.rdls_coverage === 'Extension' ? 'bg-yellow-100 text-yellow-800' :
                      dt.rdls_coverage === 'Partial' ? 'bg-orange-100 text-orange-800' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {dt.rdls_coverage || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{dt.rdls_component || '-'}</td>
                  <td className="px-4 py-3">
                    {dt.example_dataset && dt.example_url ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yes
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-sm">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAndSortedDataTypes.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No data types match your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
