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
    
    toast.success(t('dataExportedSuccess'));
  };

  const clearAllData = () => {
    localStorage.removeItem('cycleTracker_cycles');
    localStorage.removeItem('cycleTracker_symptoms');
    localStorage.removeItem('cycleTracker_notes');
    localStorage.removeItem('cycleTracker_theme');
    localStorage.removeItem('cycleTracker_language');
    toast.success(t('allDataCleared'));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          {t('settingsTitle')}
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {t('customizeExperience')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Globe size={20} />
              {t('language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-base font-medium" style={{ color: colors.text }}>
                {t('selectLanguage')}
              </Label>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="mt-2" style={{ borderColor: colors.accent }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('english')}</SelectItem>
                  <SelectItem value="fr">{t('french')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Palette size={20} />
              {t('themeAppearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium" style={{ color: colors.text }}>
                {t('chooseTheme')}
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
                        {t(key === 'neutral' ? 'calmNeutrals' : key === 'earthy' ? 'earthyTones' : 'minimalMonochrome')}
                      </h3>
                      {currentTheme === key && (
                        <Badge style={{ backgroundColor: theme.colors.primary + '20', color: theme.colors.primary }}>
                          {t('active')}
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
              {t('notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium" style={{ color: colors.text }}>
                  {t('periodReminders')}
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t('periodRemindersDesc')}
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
                  {t('ovulationReminders')}
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t('ovulationRemindersDesc')}
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
                  {t('fertileWindow')}
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t('fertileWindowDesc')}
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
                  {t('dailyCheck')}
                </Label>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t('dailyCheckDesc')}
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
              {t('privacyData')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium" style={{ color: colors.text }}>
                {t('dataStorage')}
              </Label>
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                {t('dataStorageDesc')}
              </p>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.text }}>
                    {t('cyclesTracked')}
                  </span>
                  <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                    {cycles.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm" style={{ color: colors.text }}>
                    {t('symptomEntries')}
                  </span>
                  <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                    {symptoms.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm" style={{ color: colors.text }}>
                    {t('notesWritten')}
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
                {t('exportData')}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Trash2 size={20} className="mr-2" />
                    {t('clearAllData')}
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
              {t('about')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.text }}>
                  {t('version')}
                </span>
                <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                  1.0.0
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.text }}>
                  {t('platform')}
                </span>
                <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                  {t('webApp')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.text }}>
                  {t('dataPrivacy')}
                </span>
                <Badge variant="outline" style={{ borderColor: colors.accent, color: colors.text }}>
                  {t('localStorage')}
                </Badge>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {t('aboutDesc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;