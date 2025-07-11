import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CycleProvider } from './contexts/CycleContext';
import { useCycle } from './contexts/CycleContext';
import Navigation from './components/Navigation';
import CalendarView from './components/CalendarView';
import CycleLog from './components/CycleLog';
import Insights from './components/Insights';
import Settings from './components/Settings';
import { Toaster } from './components/ui/sonner';
import './App.css';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="loading-spinner"></div>
  </div>
);

const AppContent = () => {
  const { loading, error } = useCycle();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Unable to load data</h2>
          <p className="text-gray-600">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Router>
        <div className="pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<CalendarView />} />
            <Route path="/log" element={<CycleLog />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <Navigation />
        <Toaster />
      </Router>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CycleProvider>
        <AppContent />
      </CycleProvider>
    </ThemeProvider>
  );
}

export default App;