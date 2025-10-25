import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
}

const getPageTitle = (page: Page): string => {
    switch(page.name) {
        case 'dashboard': return 'Dashboard';
        case 'data-types': return 'Data Types';
        case 'data-type-detail': return 'Data Type Details';
        case 'data-type-add': return 'Add New Data Type';
        case 'data-type-edit': return 'Edit Data Type';
        case 'datasets': return 'Datasets';
        case 'dataset-detail': return 'Dataset Details';
        case 'dataset-add': return 'Add New Dataset';
        case 'dataset-edit': return 'Edit Dataset';
        case 'categories': return 'Categories';
        case 'manage-categories': return 'Manage Categories';
        case 'progress-report': return 'Progress Report';
        case 'import-export': return 'Import / Export';
        default: return 'Urban Data Catalog';
    }
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  return (
    <header className="bg-white shadow-sm rounded-lg p-4">
        <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle(currentPage)}</h1>
    </header>
  );
};

export default Header;
