import React from 'react';
import { useData } from '../context/DataContext';
import { Page } from '../types';
import Card, { CardHeader } from '../components/Card';

interface DashboardProps {
    navigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
    const { state } = useData();
    const { dataTypes, datasets, categories } = state;

    const recentDataTypes = [...dataTypes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
                <CardHeader>Quick Stats</CardHeader>
                <div className="text-center">
                    <p className="text-4xl font-bold">{dataTypes.length}</p>
                    <p className="text-slate-600">Data Types</p>
                </div>
                <div className="text-center mt-4">
                    <p className="text-4xl font-bold">{datasets.length}</p>
                    <p className="text-slate-600">Datasets</p>
                </div>
                <div className="text-center mt-4">
                    <p className="text-4xl font-bold">{categories.length}</p>
                    <p className="text-slate-600">Categories</p>
                </div>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2">
                <CardHeader>Recently Added Data Types</CardHeader>
                {recentDataTypes.length > 0 ? (
                    <ul className="space-y-2">
                        {recentDataTypes.map(dt => (
                            <li key={dt.id} 
                                className="p-3 bg-slate-50 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                                onClick={() => navigate({ name: 'dataTypeDetail', id: dt.id })}>
                                <p className="font-bold text-slate-800">{dt.name}</p>
                                <p className="text-sm text-slate-500">{new Date(dt.created_at).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500">No data types have been added yet.</p>}
            </Card>

            {/* Actions */}
            <Card className="md:col-span-3">
                <CardHeader>Quick Actions</CardHeader>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => navigate({ name: 'dataTypeForm' })} className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600">+ Add Data Type</button>
                    <button onClick={() => navigate({ name: 'datasetForm' })} className="bg-button-blue text-white px-4 py-2 rounded-md hover:bg-blue-600">+ Add Dataset</button>
                    <button onClick={() => navigate({ name: 'manageCategories' })} className="bg-gray-200 px-4 py-2 rounded-md">Manage Categories</button>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
