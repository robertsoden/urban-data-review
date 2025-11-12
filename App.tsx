import React, { useState } from 'react';
import { useData } from './context/DataContext';
import { Page } from './types';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DataTypesList from './pages/DataTypesList';
import DataTypeDetail from './pages/DataTypeDetail';
import DataTypeForm from './pages/DataTypeForm';
import DatasetsList from './pages/DatasetsList';
import DatasetDetail from './pages/DatasetDetail';
import DatasetForm from './pages/DatasetForm';
import ProgressReport from './pages/ProgressReport';
import Categories from './pages/Categories';
import ManageCategories from './pages/ManageCategories';
import ImportExport from './pages/ImportExport';
import NotificationPopup from './components/NotificationPopup';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>({ name: 'home' });

  const navigate = (newPage: Page) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page.name) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'data-types':
        return <DataTypesList
                  navigate={navigate}
                  initialCategory={'initialCategory' in page ? page.initialCategory : undefined}
                  initialStatus={'initialStatus' in page ? page.initialStatus : undefined}
                />;
      case 'data-type-detail':
        return <DataTypeDetail navigate={navigate} id={page.id} />;
      case 'data-type-add':
        return <DataTypeForm navigate={navigate} />;
       case 'data-type-edit':
        return <DataTypeForm navigate={navigate} id={page.id} />;
      case 'datasets':
        return <DatasetsList navigate={navigate} />;
      case 'dataset-detail':
        return <DatasetDetail navigate={navigate} id={page.id} />;
      case 'dataset-add':
        return <DatasetForm navigate={navigate} />;
      case 'dataset-edit':
        return <DatasetForm navigate={navigate} id={page.id} />;
      case 'progress-report':
        return <ProgressReport navigate={navigate} />;
      case 'categories':
        return <Categories navigate={navigate} />;
      case 'manage-categories':
        return <ManageCategories navigate={navigate} />;
      case 'import-export':
        return <ImportExport navigate={navigate} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">
      <NotificationPopup />
      <Header navigate={navigate} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
