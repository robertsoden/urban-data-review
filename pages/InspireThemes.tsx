import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card } from '../components/Card';

interface InspireThemesProps {
  navigate: (page: Page) => void;
}

const InspireThemes: React.FC<InspireThemesProps> = ({ navigate }) => {
  const { inspireThemes, dataTypes } = useData();

  // Group data types by theme
  const themeStats = inspireThemes.map(theme => {
    const themeDataTypes = dataTypes.filter(dt => dt.inspire_theme === theme.name);
    return {
      ...theme,
      dataTypeCount: themeDataTypes.length
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Categories</h1>
          <p className="mt-1 text-neutral-600">
            Browse data types organized by category
          </p>
        </div>
        <button
          onClick={() => navigate({ name: 'manage-categories' })}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          Manage Categories
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-right">Data Types</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {themeStats.map(theme => (
                <tr
                  key={theme.id}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => navigate({ name: 'data-types', initialTheme: theme.name })}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900 hover:text-primary-600 transition-colors">
                      {theme.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {theme.dataTypeCount}
                    </span>
                  </td>
                </tr>
              ))}
              {themeStats.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-12 text-neutral-500">
                    No categories found. Import data to see categories.
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

export default InspireThemes;
