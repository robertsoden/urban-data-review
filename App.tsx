import React, { useState } from 'react';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { Page } from './types';
import Header from './components/Header';
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
import LoginPage from './pages/LoginPage';
import { HomeIcon, DocumentTextIcon, DatabaseIcon, ChartBarIcon, CollectionIcon, SwitchHorizontalIcon, LogoutIcon } from './components/Icons';


const App: React.FC = () => {
  const [page, setPage] = useState<Page>({ name: 'dashboard' });
  const { notifications } = useData();
  const { user, loading, logout } = useAuth();

  const navigate = (newPage: Page) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl font-semibold text-slate-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }


  const renderPage = () => {
    switch (page.name) {
      case 'dashboard':
        return <Dashboard navigate={navigate} />;
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
        return <Dashboard navigate={navigate} />;
    }
  };
  
  const NavLink: React.FC<{
    targetPage?: Page;
    onClick?: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ targetPage, onClick, icon, children }) => {
    const isActive = targetPage && page.name === targetPage.name;
    const activeClasses = 'bg-slate-200 text-slate-900';
    const inactiveClasses = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    
    const clickHandler = onClick ? onClick : () => targetPage && navigate(targetPage);

    return (
      <button onClick={clickHandler} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
          <div className="mr-3">{icon}</div>
          {children}
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <NotificationPopup />
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 p-4 fixed h-full flex flex-col">
            <div className="flex items-center mb-8 shrink-0">
                <DatabaseIcon className="w-8 h-8 text-button-blue" />
                <h1 className="ml-2 text-xl font-bold text-slate-800">Urban Data Catalog</h1>
            </div>
            <nav className="space-y-2 flex-grow">
                <NavLink targetPage={{name: 'dashboard'}} icon={<HomeIcon className="w-5 h-5" />}>Dashboard</NavLink>
                <NavLink targetPage={{name: 'data-types'}} icon={<DocumentTextIcon className="w-5 h-5" />}>Data Types</NavLink>
                <NavLink targetPage={{name: 'datasets'}} icon={<DatabaseIcon className="w-5 h-5" />}>Datasets</NavLink>
                <NavLink targetPage={{name: 'categories'}} icon={<CollectionIcon className="w-5 h-5" />}>Categories</NavLink>
                <NavLink targetPage={{name: 'progress-report'}} icon={<ChartBarIcon className="w-5 h-5" />}>Progress Report</NavLink>
                <NavLink targetPage={{name: 'import-export'}} icon={<SwitchHorizontalIcon className="w-5 h-5" />}>Import/Export</NavLink>
            </nav>
             <div className="mt-auto shrink-0">
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 truncate" title={user.email || 'User'}>Logged in as:</p>
                  <p className="text-sm font-semibold text-slate-800 truncate" title={user.email || 'User'}>{user.displayName || user.email}</p>
                   <NavLink onClick={logout} icon={<LogoutIcon className="w-5 h-5" />}>Logout</NavLink>
                </div>
            </div>
        </aside>

        <main className="flex-1 ml-64 p-6 sm:p-8 lg:p-10">
          <Header currentPage={page} />
          <div className="mt-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;