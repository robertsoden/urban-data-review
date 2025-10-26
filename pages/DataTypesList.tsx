import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import Card, { CardHeader } from '../components/Card';

interface DataTypesListProps {
  navigate: (page: Page) => void;
}

const DataTypesList: React.FC<DataTypesListProps> = ({ navigate }) => {
  const { state } = useData();
  const { dataTypes, categories } = state;
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredDataTypes = dataTypes
    .filter(dt => dt.name.toLowerCase().includes(filter.toLowerCase()))
    .filter(dt => categoryFilter === 'All' || dt.category === categoryFilter);

  return (
    <Card>
      <CardHeader>
        Data Types
        <button
          onClick={() => navigate({ name: 'dataTypeForm' })}
          className="ml-auto bg-button-blue text-white px-3 py-1 rounded-md text-sm"
        >
          + Add New
        </button>
      </CardHeader>
      
      <div className="flex mb-4 space-x-4">
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-md"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filteredDataTypes.map(dataType => (
          <div
            key={dataType.id}
            className="p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => navigate({ name: 'dataTypeDetail', id: dataType.id })}
          >
            <h3 className="font-bold text-slate-800">{dataType.name}</h3>
            <p className="text-sm text-slate-600">{dataType.category}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DataTypesList;
