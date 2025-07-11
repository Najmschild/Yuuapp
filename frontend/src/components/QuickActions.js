import React, { useState } from 'react';
import { Plus, Droplets, Heart, MessageSquare, X } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

const QuickActions = () => {
  const { cycles, addCycle, addSymptom, addNote } = useCycle();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [showActions, setShowActions] = useState(false);
  const [showSymptomQuick, setShowSymptomQuick] = useState(false);

  const isCurrentlyOnPeriod = () => {
    if (cycles.length === 0) return false;
    
    const today = new Date();
    const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    const lastCycle = sortedCycles[0];
    
    if (!lastCycle) return false;
    
    const lastCycleStart = new Date(lastCycle.startDate);
    const lastCycleEnd = lastCycle.endDate ? new Date(lastCycle.endDate) : null;
    
    return lastCycleEnd ? 
      (today >= lastCycleStart && today <= lastCycleEnd) :
      (today >= lastCycleStart && today <= new Date(lastCycleStart.getTime() + 5 * 24 * 60 * 60 * 1000));
  };

  const handleQuickPeriodStart = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await addCycle({
        startDate: today,
        flow: 'medium',
        length: 28
      });
      toast.success(t('periodLoggedSuccess'));
      setShowActions(false);
    } catch (error) {
      toast.error(t('somethingWentWrong'));
    }
  };

  const handleQuickPeriodEnd = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      const lastCycle = sortedCycles[0];
      
      if (lastCycle && !lastCycle.endDate) {
        const startDate = new Date(lastCycle.startDate);
        const endDate = new Date(today);
        const length = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        await addCycle({
          ...lastCycle,
          endDate: today,
          length
        });
        toast.success(t('periodLoggedSuccess'));
        setShowActions(false);
      }
    } catch (error) {
      toast.error(t('somethingWentWrong'));
    }
  };

  const handleQuickSymptom = async (symptom, intensity = 'mild') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await addSymptom({
        date: today,
        symptoms: [symptom],
        intensity
      });
      toast.success(t('symptomsLoggedSuccess'));
      setShowSymptomQuick(false);
    } catch (error) {
      toast.error(t('somethingWentWrong'));
    }
  };

  const commonSymptoms = [
    { key: 'cramps', intensity: 'moderate' },
    { key: 'headache', intensity: 'mild' },
    { key: 'fatigue', intensity: 'moderate' },
    { key: 'mood_swings', intensity: 'mild' },
    { key: 'bloating', intensity: 'mild' },
    { key: 'tender_breasts', intensity: 'mild' }
  ];

  const getSmartIntensity = (symptom) => {
    // Could implement ML-based suggestions here
    // For now, return common intensities
    switch (symptom) {
      case 'cramps':
      case 'fatigue':
        return 'moderate';
      case 'headache':
      case 'back_pain':
        return 'moderate';
      default:
        return 'mild';
    }
  };

  return (
    <>
      {/* Main FAB */}
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          onClick={() => setShowActions(!showActions)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
            showActions ? 'rotate-45' : ''
          }`}
          style={{ 
            backgroundColor: colors.primary,
            color: colors.background
          }}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Quick Actions Menu */}
      {showActions && (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 mb-20">
          <div className="flex flex-col gap-3">
            {/* Period Toggle */}
            <Button
              onClick={isCurrentlyOnPeriod() ? handleQuickPeriodEnd : handleQuickPeriodStart}
              className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                backgroundColor: colors.period,
                color: colors.background
              }}
            >
              <Droplets size={20} />
            </Button>

            {/* Symptoms */}
            <Button
              onClick={() => setShowSymptomQuick(true)}
              className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                backgroundColor: colors.fertile,
                color: colors.background
              }}
            >
              <Heart size={20} />
            </Button>

            {/* Notes */}
            <Button
              onClick={() => {
                // Quick note functionality could be added here
                toast.info('Feature coming soon!');
              }}
              className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                backgroundColor: colors.ovulation,
                color: colors.background
              }}
            >
              <MessageSquare size={20} />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Symptom Selector */}
      {showSymptomQuick && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md" style={{ backgroundColor: colors.surface }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  {t('quickActions')}
                </h3>
                <Button
                  onClick={() => setShowSymptomQuick(false)}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {commonSymptoms.map(({ key, intensity }) => (
                  <Button
                    key={key}
                    onClick={() => handleQuickSymptom(key, intensity)}
                    variant="outline"
                    className="p-3 h-auto flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                    style={{ 
                      borderColor: colors.accent,
                      color: colors.text
                    }}
                  >
                    <Heart size={16} />
                    <span className="text-xs text-center">{t(key)}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Labels (appears on hover) */}
      {showActions && (
        <div className="fixed bottom-24 right-20 md:bottom-6 md:right-20 z-30 mb-20">
          <div className="flex flex-col gap-3 items-end">
            <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
              {isCurrentlyOnPeriod() ? t('quickPeriodEnd') : t('quickPeriodStart')}
            </div>
            <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
              {t('logSymptoms')}
            </div>
            <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
              {t('addNote')}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;