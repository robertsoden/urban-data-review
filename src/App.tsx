import React, { useState } from 'react';
import { Page } from '../types';
import NotificationPopup from '../components/NotificationPopup';
import Review from '../pages/Review';
import ReviewItem from '../pages/ReviewItem';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>({ name: 'review' });

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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans">
      <NotificationPopup />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
