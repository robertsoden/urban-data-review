import React from 'react';
import { useData } from '../context/DataContext';
import { Page, CompletionStatus } from '../types';
import Card, { CardHeader } from '../components/Card';

interface CategoriesProps {
  navigate: (page: Page) => void;
}

const Categories: React.FC<CategoriesProps> = ({ navigate }) => {
  const { categories, dataTypes } = useData();

  const dataTypesByCategory = categories.map(category => {
    const dts = dataTypes.filter(dt => dt.category === category.name);
    return {
      ...category,
      total: dts.length,
      complete: dts.filter(dt => dt.completion_status === CompletionStatus.Complete).length,
      inProgress: dts.filter(dt => dt.completion_status === CompletionStatus.InProgress).length,
      notStarted: dts.filter(dt => dt.completion_status === CompletionStatus.NotStarted).length,
    };
  });

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Categories</h1>
        <button onClick={() => navigate({ name: 'manage-categories' })} className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm">
          Manage Categories
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataTypesByCategory.map(category => (
          <Card key={category.id} className="flex flex-col">
            <CardHeader className="flex-grow-0">{category.name} ({category.total})</CardHeader>
            <p className="text-slate-600 mb-4 flex-grow">{category.description || <span className="italic">No description provided.</span>}</p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Complete:</span>
                <span className="font-semibold text-green-600">{category.complete}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">In Progress:</span>
                <span className="font-semibold text-yellow-600">{category.inProgress}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-slate-500">Not Started:</span>
                <span className="font-semibold text-red-600">{category.notStarted}</span>
              </div>
            </div>

            <button
                onClick={() => navigate({ name: 'data-types', initialCategory: category.name })}
                className="w-full mt-auto bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 transition-colors font-semibold"
                disabled={category.total === 0}
            >
                View {category.total} Data Types
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories;