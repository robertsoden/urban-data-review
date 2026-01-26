import React, { useState } from 'react';
import { Page } from '../types';
import NotificationPopup from '../components/NotificationPopup';
import Review from '../pages/Review';
import ReviewItem from '../pages/ReviewItem';
import { useData } from '../context/DataContext';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>({ name: 'review' });
  const { isLocalOnly, loading } = useData();

  const navigate = (newPage: Page) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page.name) {
      case 'review':
        return <Review navigate={navigate} />;
      case 'review-item':
        return <ReviewItem navigate={navigate} index={page.index} />;
      default:
        return <Review navigate={navigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">
      {isLocalOnly && (
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 text-sm px-4 py-2 text-center">
          Database unavailable — data is being stored locally in your browser only
        </div>
      )}
      <NotificationPopup />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
