import React, { useState, useEffect } from 'react';
import { Palette, Bell, Shield, Download, Trash2, Globe, Smartphone } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCycle } from '../contexts/CycleContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner';

const Settings = () => {
  const { currentTheme, themes, switchTheme, colors, preferences, updateNotificationPreferences } = useTheme();
  const { cycles, symptoms, notes } = useCycle();
  const { currentLanguage, switchLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState({
    periodReminders: true,
    ovulationReminders: true,
    fertileWindow: false,
    dailyCheck: false
  });

  // Load notification preferences from backend
  useEffect(() => {
    if (preferences && preferences.notifications) {
      setNotifications(preferences.notifications);
    }
  }, [preferences]);

  const handleNotificationToggle = async (type) => {
    const newNotifications = {
      ...notifications,
      [type]: !notifications[type]
    };
    
    setNotifications(newNotifications);
    
    try {
      await updateNotificationPreferences(newNotifications);
      toast.success(t('notificationSettingsUpdated'));
    } catch (error) {
      // Revert on error
      setNotifications(notifications);
      toast.error('Failed to update notification settings');
    }
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      await switchLanguage(languageCode);
      toast.success('Language updated successfully');
    } catch (error) {
      toast.error('Failed to update language');
    }
  };

  const exportData = () => {
    const data = {
      cycles,
      symptoms,
      notes,
      preferences,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cycle-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const clearAllData = () => {
    localStorage.removeItem('cycleTracker_cycles');
    localStorage.removeItem('cycleTracker_symptoms');
    localStorage.removeItem('cycleTracker_notes');
    localStorage.removeItem('cycleTracker_theme');
    toast.success('All local data cleared. Please refresh the page.');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Customize your cycle tracking experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Palette size={20} />
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium" style={{ color: colors.text }}>
                Choose Your Theme
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => switchTheme(key)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      currentTheme === key ? 'shadow-lg transform scale-105' : ''
                    }`}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: currentTheme === key ? theme.colors.primary : theme.colors.accent + '40'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold" style={{ color: theme.colors.text }}>
                        {theme.name}
                      </h3>
                      {currentTheme === key && (
                        <Badge style={{ backgroundColor: theme.colors.primary + '20', color: theme.colors.primary }}>
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2"
                        style={{ 
                          backgroundColor: theme.colors.period,
                          borderColor: theme.colors.text + '20'
                        }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2"
                        style={{ 
                          backgroundColor: theme.colors.fertile,
                          borderColor: theme.colors.text + '20'
                        }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2"
                        style={{ 
                          backgroundColor: theme.colors.ovulation,
                          borderColor: theme.colors.text + '20'
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Bell size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium" style={{ color: colors.text }}>
                  Period Reminders
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Get notified 2 days before your predicted period
                </p>
              </div>
              <Switch
                checked={notifications.periodReminders}
                onCheckedChange={() => handleNotificationToggle('periodReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium" style={{ color: colors.text }}>
                  Ovulation Reminders
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Get notified during your fertile window
                </p>
              </div>
              <Switch
                checked={notifications.ovulationReminders}
                onCheckedChange={() => handleNotificationToggle('ovulationReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium" style={{ color: colors.text }}>
                  Fertile Window
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Daily reminders during your fertile days
                </p>
              </div>
              <Switch
                checked={notifications.fertileWindow}
                onCheckedChange={() => handleNotificationToggle('fertileWindow')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium" style={{ color: colors.text }}>
                  Daily Check-ins
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Gentle daily reminders to log symptoms
                </p>
              </div>
              <Switch
                checked={notifications.dailyCheck}
                onCheckedChange={() => handleNotificationToggle('dailyCheck')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Shield size={20} />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium" style={{ color: colors.text }}>
                Data Storage
              </Label>
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                All your data is stored securely on your device. No cloud sync or external sharing.
              </p>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.text }}>
                    Cycles tracked
                  </span>
                  <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                    {cycles.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm" style={{ color: colors.text }}>
                    Symptom entries
                  </span>
                  <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                    {symptoms.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm" style={{ color: colors.text }}>
                    Notes written
                  </span>
                  <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                    {notes.length}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={exportData}
                className="flex-1 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.background
                }}
              >
                <Download size={20} className="mr-2" />
                Export Data
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your cycle data,
                      symptoms, and notes from this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllData}>
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Smartphone size={20} />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.text }}>
                  Version
                </span>
                <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                  1.0.0
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.text }}>
                  Platform
                </span>
                <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                  Web App
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.text }}>
                  Data Privacy
                </span>
                <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                  Local Storage
                </Badge>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                This app is designed to be your personal, private menstrual health companion. 
                All data remains on your device, giving you complete control over your health information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;