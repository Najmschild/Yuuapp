import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  neutral: {
    name: 'Calm Neutrals',
    colors: {
      primary: '#8B7355',
      secondary: '#E8E2D5',
      accent: '#C4B5A0',
      background: '#FEFCF8',
      surface: '#F5F1EB',
      text: '#3A342C',
      textSecondary: '#6B6157',
      period: '#D4A574',
      fertile: '#A8C8A8',
      ovulation: '#F4B942',
      predicted: '#B8A082'
    }
  },
  earthy: {
    name: 'Earthy Tones',
    colors: {
      primary: '#7A6C5D',
      secondary: '#E4D5C7',
      accent: '#B8956A',
      background: '#F8F6F3',
      surface: '#F0EBE4',
      text: '#2C251E',
      textSecondary: '#5C4F42',
      period: '#C17767',
      fertile: '#8FA68C',
      ovulation: '#E6A532',
      predicted: '#A89179'
    }
  },
  monochrome: {
    name: 'Minimal Monochrome',
    colors: {
      primary: '#1A1A1A',
      secondary: '#F5F5F5',
      accent: '#666666',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#000000',
      textSecondary: '#666666',
      period: '#404040',
      fertile: '#808080',
      ovulation: '#2D2D2D',
      predicted: '#B0B0B0'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('neutral');
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load preferences from backend
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await axios.get(`${API}/preferences`);
        setPreferences(response.data);
        setCurrentTheme(response.data.theme || 'neutral');
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('cycleTracker_theme');
        if (savedTheme && themes[savedTheme]) {
          setCurrentTheme(savedTheme);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cycleTracker_theme', currentTheme);
      
      // Apply theme colors to CSS custom properties
      const theme = themes[currentTheme];
      const root = document.documentElement;
      
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
    }
  }, [currentTheme, loading]);

  const switchTheme = async (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      
      try {
        // Update backend preferences
        await axios.put(`${API}/preferences`, { theme: themeName });
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  const updateNotificationPreferences = async (notifications) => {
    try {
      const response = await axios.put(`${API}/preferences`, { notifications });
      setPreferences(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  };

  const value = {
    currentTheme,
    themes,
    preferences,
    loading,
    switchTheme,
    updateNotificationPreferences,
    colors: themes[currentTheme].colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};