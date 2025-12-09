import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card, CardContent } from '../components/Card';
import { DocumentTextIcon, DatabaseIcon, CollectionIcon } from '../components/Icons';

interface HomeProps {
  navigate: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; onClick: () => void; }> = ({ title, value, icon, onClick }) => (
  <Card
    onClick={onClick}
    className="cursor-pointer hover:shadow-lg hover:border-primary-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
  >
    <CardContent>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="text-2xl font-bold text-neutral-800">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { dataTypes, datasets, inspireThemes } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Urban Data Review</h1>
        <p className="mt-1 text-neutral-600">Overview of your data catalog</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Data Types" value={dataTypes.length} icon={<DocumentTextIcon className="w-6 h-6" />} onClick={() => navigate({name: 'data-types'})} />
        <StatCard title="Total Datasets" value={datasets.length} icon={<DatabaseIcon className="w-6 h-6" />} onClick={() => navigate({name: 'datasets'})} />
        <StatCard title="Categories" value={inspireThemes.length} icon={<CollectionIcon className="w-6 h-6" />} onClick={() => navigate({name: 'inspire-themes'})} />
      </div>

      <div>
        <h2
          className="text-2xl font-bold text-neutral-800 mb-4 cursor-pointer hover:text-primary-600 transition-colors"
          onClick={() => navigate({ name: 'data-types' })}
        >
          Data Types
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider">RDLS Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {dataTypes.map(dt => (
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
              {dataTypes.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-neutral-500">
                    No data types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default Home;
