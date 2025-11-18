import React from 'react';
import { useData } from '../context/DataContext';
import { Page, CompletionStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { PlusIcon } from '../components/Icons';

interface CategoriesProps {
  navigate: (page: Page) => void;
}

const Categories: React.FC<CategoriesProps> = ({ navigate }) => {
  const { categories, dataTypes } = useData();
  const showProgress = import.meta.env.VITE_SHOW_PROGRESS === 'true';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button 
          onClick={() => navigate({ name: 'manage-categories' })}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Manage Categories
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataTypesByCategory.map(category => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span 
                    className="cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => navigate({ name: 'data-types', initialCategory: category.name })}
                >
                    {category.name}
                </span>
                <span className="text-sm font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded-full">{category.total}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <p className="text-neutral-600 mb-4 flex-grow">{category.description || <span className="italic">No description provided.</span>}</p>

              {showProgress && (
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Complete</span>
                    <span className="font-semibold text-success">{category.complete}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">In Progress</span>
                    <span className="font-semibold text-warning">{category.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Not Started</span>
                    <span className="font-semibold text-danger">{category.notStarted}</span>
                  </div>
                </div>
              )}

              <button
                  onClick={() => navigate({ name: 'data-types', initialCategory: category.name })}
                  className="w-full mt-auto bg-neutral-100 text-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={category.total === 0}
              >
                  View Data Types
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories;
