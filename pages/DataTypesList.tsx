import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Page, DataType, CompletionStatus } from '../types';
import { Card } from '../components/Card';
import { CompletionStatusBadge, PriorityBadge } from '../components/Badge';

interface DataTypesListProps {
  navigate: (page: Page) => void;
  initialCategory?: string;
  initialStatus?: CompletionStatus;
}

const DataTypesList: React.FC<DataTypesListProps> = ({ navigate, initialCategory, initialStatus }) => {
  const { dataTypes, categories } = useData();
  
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
      const searchMatch = searchTerm === '' || dt.name.toLowerCase().includes(searchTerm.toLowerCase()) || dt.uid.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [dataTypes, categoryFilter, statusFilter, searchTerm]);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Data Types</h1>
        <button onClick={() => navigate({ name: 'data-type-add' })} className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm">
          Add New Data Type
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="All">All Statuses</option>
            {Object.values(CompletionStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700">Search</label>
          <input id="search-filter" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="by name or UID..." className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"/>
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3">UID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredDataTypes.map(dt => (
              <tr 
                key={dt.id} 
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate({ name: 'data-type-detail', id: dt.id })}
              >
                <td className="p-3 font-mono text-sm text-slate-500">{dt.uid}</td>
                <td className="p-3 font-medium text-slate-900 text-header-blue hover:text-button-blue">{dt.name}</td>
                <td className="p-3 text-slate-600">{dt.category}</td>
                <td className="p-3"><PriorityBadge priority={dt.priority} /></td>
                <td className="p-3"><CompletionStatusBadge status={dt.completion_status} /></td>
              </tr>
            ))}
             {filteredDataTypes.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-500">
                        No data types match the current filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DataTypesList;