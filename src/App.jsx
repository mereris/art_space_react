// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import GalleryPage from './pages/GalleryPage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import ProfilePage from './pages/ProfilePage';
import OtherUserProfilePage from './pages/OtherUserProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import WorkPage from './pages/WorkPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Header />
          <main>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<MainPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/work/:id" element={<WorkPage />} />
              
              {/* Защищённые маршруты (только для авторизованных) */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:username" element={
                <ProtectedRoute>
                  <OtherUserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;