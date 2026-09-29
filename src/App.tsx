import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastBanner } from './components/ToastBanner';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PlanPage } from './pages/PlanPage';
import { MyDayPage } from './pages/MyDayPage';
import { DayModePage } from './pages/DayModePage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';
import { BookingsPage } from './pages/BookingsPage';
import { WishlistPage } from './pages/WishlistPage';
import { MyDaysPage } from './pages/MyDaysPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <ToastBanner />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/my-day" element={<MyDayPage />} />
              <Route path="/day-mode" element={<DayModePage />} />
              <Route path="/experience/:id" element={<ExperienceDetailPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/my-days" element={<MyDaysPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
