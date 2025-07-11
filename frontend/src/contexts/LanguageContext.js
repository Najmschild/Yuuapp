import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    calendar: 'Calendar',
    log: 'Log',
    insights: 'Insights',
    settings: 'Settings',
    
    // Calendar View
    cycleCalendar: 'Cycle Calendar',
    trackCycleSubtitle: 'Track your cycle, symptoms, and wellness',
    upcomingPredictions: 'Upcoming Predictions',
    nextPeriod: 'Next Period',
    ovulation: 'Ovulation',
    avgCycle: 'Avg Cycle',
    days: 'days',
    
    // Cycle Phases
    menstrual: 'Menstrual',
    follicular: 'Follicular', 
    ovulation: 'Ovulation',
    luteal: 'Luteal',
    
    // Legend
    period: 'Period',
    fertile: 'Fertile',
    predicted: 'Predicted',
    
    // Today Widget
    todayWidget: 'Today',
    cycleDay: 'Cycle Day',
    currentPhase: 'Current Phase',
    daysUntilNext: 'days until next period',
    
    // Quick Actions
    quickPeriodStart: 'Start Period',
    quickPeriodEnd: 'End Period',
    logSymptoms: 'Log Symptoms',
    addNote: 'Add Note',
    
    // Cycle Log
    logYourCycle: 'Log Your Cycle',
    recordPeriod: 'Record your period, symptoms, and daily notes',
    logPeriod: 'Log Period',
    logSymptoms: 'Log Symptoms',
    dailyNotes: 'Daily Notes',
    
    // Period Form
    startDate: 'Start Date',
    endDate: 'End Date',
    optional: 'Optional',
    flowIntensity: 'Flow Intensity',
    light: 'Light',
    medium: 'Medium',
    heavy: 'Heavy',
    savePeriod: 'Save Period',
    
    // Symptoms
    symptoms: 'Symptoms',
    intensity: 'Intensity',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    saveSymptoms: 'Save Symptoms',
    
    // Common Symptoms
    cramps: 'Cramps',
    headache: 'Headache',
    bloating: 'Bloating',
    mood_swings: 'Mood Swings',
    fatigue: 'Fatigue',
    tender_breasts: 'Tender Breasts',
    acne: 'Acne',
    cravings: 'Cravings',
    back_pain: 'Back Pain',
    nausea: 'Nausea',
    
    // Notes
    yourNote: 'Your Note',
    notePlaceholder: 'How are you feeling today? Any observations about your cycle, mood, or wellness...',
    saveNote: 'Save Note',
    
    // Insights
    healthInsights: 'Health Insights',
    understandCycle: 'Understand your cycle patterns and health trends',
    totalCyclesTracked: 'Total Cycles Tracked',
    averageCycleLength: 'Average Cycle Length',
    mostCommonFlow: 'Most Common Flow',
    cycleRegularity: 'Cycle Regularity',
    
    // Cycle Analysis
    cycleAnalysis: 'Cycle Analysis',
    cycleLengthRange: 'Cycle Length Range',
    flowPatterns: 'Flow Patterns',
    veryRegular: 'Very regular cycles',
    moderatelyRegular: 'Moderately regular cycles',
    variableLengths: 'Variable cycle lengths',
    
    // Symptoms Insights
    symptomPatterns: 'Symptom Patterns',
    mostCommonSymptoms: 'Most Common Symptoms',
    times: 'times',
    symptomTracking: 'Symptom Tracking',
    totalSymptomEntries: 'Total symptom entries',
    
    // Notes Summary
    notesSummary: 'Notes Summary',
    totalNotesWritten: 'Total notes written',
    recentNote: 'Recent Note',
    
    // Settings
    settingsTitle: 'Settings',
    customizeExperience: 'Customize your cycle tracking experience',
    themeAppearance: 'Theme & Appearance',
    chooseTheme: 'Choose Your Theme',
    active: 'Active',
    
    // Themes
    calmNeutrals: 'Calm Neutrals',
    earthyTones: 'Earthy Tones',
    minimalMonochrome: 'Minimal Monochrome',
    
    // Notifications
    notifications: 'Notifications',
    periodReminders: 'Period Reminders',
    periodRemindersDesc: 'Get notified 2 days before your predicted period',
    ovulationReminders: 'Ovulation Reminders',
    ovulationRemindersDesc: 'Get notified during your fertile window',
    fertileWindow: 'Fertile Window',
    fertileWindowDesc: 'Daily reminders during your fertile days',
    dailyCheck: 'Daily Check-ins',
    dailyCheckDesc: 'Gentle daily reminders to log symptoms',
    
    // Privacy & Data
    privacyData: 'Privacy & Data',
    dataStorage: 'Data Storage',
    dataStorageDesc: 'All your data is stored securely on your device. No cloud sync or external sharing.',
    cyclesTracked: 'Cycles tracked',
    symptomEntries: 'Symptom entries',
    notesWritten: 'Notes written',
    exportData: 'Export Data',
    clearAllData: 'Clear All Data',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    french: 'Français',
    
    // About
    about: 'About',
    version: 'Version',
    platform: 'Platform',
    webApp: 'Web App',
    dataPrivacy: 'Data Privacy',
    localStorage: 'Local Storage',
    aboutDesc: 'This app is designed to be your personal, private menstrual health companion. All data remains on your device, giving you complete control over your health information.',
    
    // Messages
    periodLoggedSuccess: 'Period logged successfully!',
    symptomsLoggedSuccess: 'Symptoms logged successfully!',
    noteSavedSuccess: 'Note saved successfully!',
    notificationSettingsUpdated: 'Notification settings updated',
    dataExportedSuccess: 'Data exported successfully',
    allDataCleared: 'All local data cleared. Please refresh the page.',
    
    // Errors
    selectStartDate: 'Please select a start date',
    selectSymptom: 'Please select at least one symptom',
    addNote: 'Please add a note',
    somethingWentWrong: 'Something went wrong. Please try again.',
    
    // Quick Actions
    quickActions: 'Quick Actions',
    periodInProgress: 'Period in Progress',
    startPeriodNow: 'Start Period Now',
    endPeriodNow: 'End Period Now',
    
    // Cycle Phase Descriptions
    menstrualPhase: 'Menstrual Phase',
    follicularPhase: 'Follicular Phase',
    ovulationPhase: 'Ovulation Phase',
    lutealPhase: 'Luteal Phase',
    
    // Days
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    
    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    
    // Regular/Irregular
    regular: 'Regular',
    somewhatIrregular: 'Somewhat Irregular',
    irregular: 'Irregular'
  },
  fr: {
    // Navigation
    calendar: 'Calendrier',
    log: 'Journal',
    insights: 'Analyses',
    settings: 'Paramètres',
    
    // Calendar View
    cycleCalendar: 'Calendrier des Cycles',
    trackCycleSubtitle: 'Suivez votre cycle, symptômes et bien-être',
    upcomingPredictions: 'Prédictions à Venir',
    nextPeriod: 'Prochaines Règles',
    ovulation: 'Ovulation',
    avgCycle: 'Cycle Moyen',
    days: 'jours',
    
    // Cycle Phases
    menstrual: 'Menstruel',
    follicular: 'Folliculaire',
    ovulation: 'Ovulation',
    luteal: 'Lutéal',
    
    // Legend
    period: 'Règles',
    fertile: 'Fertile',
    predicted: 'Prédit',
    
    // Today Widget
    todayWidget: 'Aujourd\'hui',
    cycleDay: 'Jour du Cycle',
    currentPhase: 'Phase Actuelle',
    daysUntilNext: 'jours jusqu\'aux prochaines règles',
    
    // Quick Actions
    quickPeriodStart: 'Commencer les Règles',
    quickPeriodEnd: 'Finir les Règles',
    logSymptoms: 'Noter les Symptômes',
    addNote: 'Ajouter une Note',
    
    // Cycle Log
    logYourCycle: 'Journal de Cycle',
    recordPeriod: 'Enregistrez vos règles, symptômes et notes quotidiennes',
    logPeriod: 'Noter les Règles',
    dailyNotes: 'Notes Quotidiennes',
    
    // Period Form
    startDate: 'Date de Début',
    endDate: 'Date de Fin',
    optional: 'Optionnel',
    flowIntensity: 'Intensité du Flux',
    light: 'Léger',
    medium: 'Moyen',
    heavy: 'Abondant',
    savePeriod: 'Sauvegarder les Règles',
    
    // Symptoms
    symptoms: 'Symptômes',
    intensity: 'Intensité',
    mild: 'Léger',
    moderate: 'Modéré',
    severe: 'Sévère',
    saveSymptoms: 'Sauvegarder les Symptômes',
    
    // Common Symptoms
    cramps: 'Crampes',
    headache: 'Mal de Tête',
    bloating: 'Ballonnements',
    mood_swings: 'Sautes d\'Humeur',
    fatigue: 'Fatigue',
    tender_breasts: 'Seins Sensibles',
    acne: 'Acné',
    cravings: 'Envies',
    back_pain: 'Mal de Dos',
    nausea: 'Nausée',
    
    // Notes
    yourNote: 'Votre Note',
    notePlaceholder: 'Comment vous sentez-vous aujourd\'hui? Observations sur votre cycle, humeur ou bien-être...',
    saveNote: 'Sauvegarder la Note',
    
    // Insights
    healthInsights: 'Analyses de Santé',
    understandCycle: 'Comprenez vos tendances et modèles de cycle',
    totalCyclesTracked: 'Total des Cycles Suivis',
    averageCycleLength: 'Durée Moyenne du Cycle',
    mostCommonFlow: 'Flux le Plus Courant',
    cycleRegularity: 'Régularité du Cycle',
    
    // Cycle Analysis
    cycleAnalysis: 'Analyse du Cycle',
    cycleLengthRange: 'Plage de Durée du Cycle',
    flowPatterns: 'Modèles de Flux',
    veryRegular: 'Cycles très réguliers',
    moderatelyRegular: 'Cycles modérément réguliers',
    variableLengths: 'Durées de cycle variables',
    
    // Symptoms Insights
    symptomPatterns: 'Modèles de Symptômes',
    mostCommonSymptoms: 'Symptômes les Plus Courants',
    times: 'fois',
    symptomTracking: 'Suivi des Symptômes',
    totalSymptomEntries: 'Total des entrées de symptômes',
    
    // Notes Summary
    notesSummary: 'Résumé des Notes',
    totalNotesWritten: 'Total des notes écrites',
    recentNote: 'Note Récente',
    
    // Settings
    settingsTitle: 'Paramètres',
    customizeExperience: 'Personnalisez votre expérience de suivi',
    themeAppearance: 'Thème et Apparence',
    chooseTheme: 'Choisir Votre Thème',
    active: 'Actif',
    
    // Themes
    calmNeutrals: 'Neutres Apaisants',
    earthyTones: 'Tons Terreux',
    minimalMonochrome: 'Monochrome Minimal',
    
    // Notifications
    notifications: 'Notifications',
    periodReminders: 'Rappels de Règles',
    periodRemindersDesc: 'Recevez une notification 2 jours avant vos règles prévues',
    ovulationReminders: 'Rappels d\'Ovulation',
    ovulationRemindersDesc: 'Recevez des notifications pendant votre fenêtre fertile',
    fertileWindow: 'Fenêtre Fertile',
    fertileWindowDesc: 'Rappels quotidiens pendant vos jours fertiles',
    dailyCheck: 'Vérifications Quotidiennes',
    dailyCheckDesc: 'Rappels doux quotidiens pour noter les symptômes',
    
    // Privacy & Data
    privacyData: 'Confidentialité et Données',
    dataStorage: 'Stockage des Données',
    dataStorageDesc: 'Toutes vos données sont stockées en sécurité sur votre appareil. Pas de synchronisation cloud ou de partage externe.',
    cyclesTracked: 'Cycles suivis',
    symptomEntries: 'Entrées de symptômes',
    notesWritten: 'Notes écrites',
    exportData: 'Exporter les Données',
    clearAllData: 'Effacer Toutes les Données',
    
    // Language
    language: 'Langue',
    selectLanguage: 'Sélectionner la Langue',
    english: 'English',
    french: 'Français',
    
    // About
    about: 'À Propos',
    version: 'Version',
    platform: 'Plateforme',
    webApp: 'Application Web',
    dataPrivacy: 'Confidentialité des Données',
    localStorage: 'Stockage Local',
    aboutDesc: 'Cette application est conçue pour être votre compagnon personnel et privé de santé menstruelle. Toutes les données restent sur votre appareil, vous donnant un contrôle total sur vos informations de santé.',
    
    // Messages
    periodLoggedSuccess: 'Règles enregistrées avec succès!',
    symptomsLoggedSuccess: 'Symptômes enregistrés avec succès!',
    noteSavedSuccess: 'Note sauvegardée avec succès!',
    notificationSettingsUpdated: 'Paramètres de notification mis à jour',
    dataExportedSuccess: 'Données exportées avec succès',
    allDataCleared: 'Toutes les données locales effacées. Veuillez actualiser la page.',
    
    // Errors
    selectStartDate: 'Veuillez sélectionner une date de début',
    selectSymptom: 'Veuillez sélectionner au moins un symptôme',
    addNote: 'Veuillez ajouter une note',
    somethingWentWrong: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
    
    // Quick Actions
    quickActions: 'Actions Rapides',
    periodInProgress: 'Règles en Cours',
    startPeriodNow: 'Commencer les Règles',
    endPeriodNow: 'Finir les Règles',
    
    // Cycle Phase Descriptions
    menstrualPhase: 'Phase Menstruelle',
    follicularPhase: 'Phase Folliculaire',
    ovulationPhase: 'Phase d\'Ovulation',
    lutealPhase: 'Phase Lutéale',
    
    // Days
    sunday: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    
    // Months
    january: 'Janvier',
    february: 'Février',
    march: 'Mars',
    april: 'Avril',
    may: 'Mai',
    june: 'Juin',
    july: 'Juillet',
    august: 'Août',
    september: 'Septembre',
    october: 'Octobre',
    november: 'Novembre',
    december: 'Décembre',
    
    // Regular/Irregular
    regular: 'Régulier',
    somewhatIrregular: 'Quelque Peu Irrégulier',
    irregular: 'Irrégulier'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  // Load language preference from backend
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const response = await axios.get(`${API}/preferences`);
        const lang = response.data.language || 'en';
        setCurrentLanguage(lang);
      } catch (error) {
        console.error('Error loading language preference:', error);
        // Fallback to localStorage
        const savedLanguage = localStorage.getItem('cycleTracker_language');
        if (savedLanguage && translations[savedLanguage]) {
          setCurrentLanguage(savedLanguage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadLanguagePreference();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cycleTracker_language', currentLanguage);
    }
  }, [currentLanguage, loading]);

  const switchLanguage = async (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
      
      try {
        // Update backend preferences
        await axios.put(`${API}/preferences`, { language: languageCode });
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || translations['en'][key] || key;
  };

  const value = {
    currentLanguage,
    availableLanguages: Object.keys(translations),
    switchLanguage,
    t,
    loading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};