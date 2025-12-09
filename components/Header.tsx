import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  navigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ navigate }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div
            className="text-xl font-bold text-primary-600 cursor-pointer"
            onClick={() => navigate({ name: 'home' })}
          >
            Urban Data Review
          </div>
          <nav className="hidden md:flex gap-4">
            <NavItem onClick={() => navigate({ name: 'data-types' })}>Data Types</NavItem>
            <NavItem onClick={() => navigate({ name: 'datasets' })}>Datasets</NavItem>
            <NavItem onClick={() => navigate({ name: 'inspire-themes' })}>Categories</NavItem>
            <NavItem onClick={() => navigate({ name: 'import-export' })}>Import/Export</NavItem>
          </nav>
        </div>
      </div>
    </header>
  );
};

const NavItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
        {children}
    </button>
)

export default Header;
