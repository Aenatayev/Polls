import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import CreatePoll from './pages/CreatePoll';
import CreateSurvey from './pages/CreateSurvey';
import SurveyList from './pages/SurveyList';
import PollList from './pages/PollList';
import ViewPoll from './pages/ViewPoll';
import ViewPollResults from './pages/ViewPollResults';
import ViewSurvey from './pages/ViewSurvey';

function App() {
  const { language } = useLanguage();

  return (
    <ErrorBoundary>
      <div dir={language === 'he' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="relative">
          <Navbar />
          <div className="transition-all duration-200 md:pl-64 rtl:md:pl-0 rtl:md:pr-64">
            <div className="min-h-[calc(100vh-4rem)]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<ProtectedRoute element={<Account />} />} />
                <Route path="/create" element={<ProtectedRoute element={<CreatePoll />} />} />
                <Route path="/create-survey" element={<ProtectedRoute element={<CreateSurvey />} />} />
                <Route path="/surveys" element={<ProtectedRoute element={<SurveyList />} />} />
                <Route path="/polls" element={<ProtectedRoute element={<PollList />} />} />
                <Route path="/poll/:id" element={<ProtectedRoute element={<ViewPoll />} />} />
                <Route path="/poll/:id/results" element={<ProtectedRoute element={<ViewPollResults />} />} />
                <Route path="/survey/:id" element={<ProtectedRoute element={<ViewSurvey />} />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;