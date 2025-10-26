import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';

interface CategoriesProps {
  navigate: (page: Page) => void;
}

const Categories: React.FC<CategoriesProps> = ({ navigate }) => {
  const { state } = useData();
  const { categories, dataTypes } = state;

  const dataTypesByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = dataTypes.filter(dt => dt.category === cat.name);
    return acc;
  }, {} as { [key: string]: typeof dataTypes });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map(category => (
        <div key={category.id} className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">{category.name}</h2>
          <ul className="space-y-2">
            {dataTypesByCategory[category.name]?.map(dt => (
              <li key={dt.id} className="text-sm p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => navigate({ name: 'dataTypeDetail', id: dt.id })}>
                {dt.name}
              </li>
            ))}
            {dataTypesByCategory[category.name]?.length === 0 && <li className="text-sm text-gray-500">No data types in this category.</li>}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Categories;
