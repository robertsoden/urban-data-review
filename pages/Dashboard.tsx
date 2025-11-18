import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { DocumentTextIcon, DatabaseIcon, CollectionIcon, ChartBarIcon } from '../components/Icons';

interface DashboardProps {
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

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
  const { dataTypes, datasets, categories } = useData();

  const essentialDataTypes = dataTypes.filter(dt => dt.priority === 'Essential').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Urban Data Review Dashboard</h1>
        <p className="text-neutral-600">Welcome! Here's a summary of your data catalog.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Data Types" value={dataTypes.length} icon={<DocumentTextIcon className="w-6 h-6" />} onClick={() => navigate({name: 'data-types'})} />
          <StatCard title="Total Datasets" value={datasets.length} icon={<DatabaseIcon className="w-6 h-6" />} onClick={() => navigate({name: 'datasets'})} />
          <StatCard title="Total Categories" value={categories.length} icon={<CollectionIcon className="w-6 h-6" />} onClick={() => navigate({name: 'categories'})} />
          <StatCard title="Progress" value={essentialDataTypes} icon={<ChartBarIcon className="w-6 h-6" />} onClick={() => navigate({name: 'progress-report'})} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-neutral max-w-none">
              <p>This tool is designed to help you manage and track essential urban datasets for your projects. You can:</p>
              <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Define Data Types:</strong> Catalog the specific types of data you need, like Building Footprints or Road Networks.</li>
                  <li><strong>Link Datasets:</strong> Connect these data types to real-world datasets from various sources.</li>
                  <li><strong>Track Progress:</strong> Use the progress report to identify gaps in your data collection.</li>
                  <li><strong>Manage Categories:</strong> Organize your data types into logical groups.</li>
              </ul>
              <p>Use the navigation bar above to explore the different sections of the application.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;
