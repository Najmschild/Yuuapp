import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();

  const navItems = [
    { path: '/', icon: Calendar, label: 'Calendar' },
    { path: '/log', icon: PlusCircle, label: 'Log' },
    { path: '/insights', icon: BarChart3, label: 'Insights' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:bottom-auto md:border-t-0 md:border-r md:w-20 md:min-h-screen md:flex-col shadow-lg"
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.accent + '40'
      }}
    >
      <div className="flex justify-around items-center h-16 md:flex-col md:h-full md:py-8 md:space-y-8">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                isActive ? 'scale-110' : ''
              }`}
              style={{
                color: isActive ? colors.primary : colors.textSecondary,
                backgroundColor: isActive ? colors.accent + '20' : 'transparent'
              }}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;