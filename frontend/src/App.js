import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CycleProvider } from './contexts/CycleContext';
import Navigation from './components/Navigation';
import CalendarView from './components/CalendarView';
import CycleLog from './components/CycleLog';
import Insights from './components/Insights';
import Settings from './components/Settings';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <CycleProvider>
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
      </CycleProvider>
    </ThemeProvider>
  );
}

export default App;