import React from 'react';
import { Calendar, Heart, Droplets, Target, TrendingUp } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const TodayWidget = () => {
  const { cycles, getPredictions } = useCycle();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const predictions = getPredictions();

  const getTodayInfo = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (cycles.length === 0) {
      return {
        cycleDay: 1,
        phase: 'unknown',
        daysUntilNext: '?',
        isOnPeriod: false
      };
    }

    const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    const lastCycle = sortedCycles[0];
    const lastCycleStart = new Date(lastCycle.startDate);
    const lastCycleEnd = lastCycle.endDate ? new Date(lastCycle.endDate) : null;
    
    // Check if currently on period
    const isOnPeriod = lastCycleEnd ? 
      (today >= lastCycleStart && today <= lastCycleEnd) :
      (today >= lastCycleStart && today <= new Date(lastCycleStart.getTime() + 5 * 24 * 60 * 60 * 1000));
    
    // Calculate cycle day
    const daysSinceLastPeriod = Math.floor((today - lastCycleStart) / (1000 * 60 * 60 * 24));
    const cycleDay = daysSinceLastPeriod + 1;
    
    // Determine phase
    let phase = 'menstrual';
    if (predictions && predictions.avgCycleLength) {
      const cycleLength = predictions.avgCycleLength;
      const ovulationDay = cycleLength - 14;
      
      if (cycleDay <= 5) {
        phase = 'menstrual';
      } else if (cycleDay <= ovulationDay - 1) {
        phase = 'follicular';
      } else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
        phase = 'ovulation';
      } else {
        phase = 'luteal';
      }
    }
    
    // Days until next period
    const daysUntilNext = predictions ? 
      Math.max(0, Math.ceil((predictions.nextPeriod - today) / (1000 * 60 * 60 * 24))) : 
      '?';
    
    return {
      cycleDay,
      phase,
      daysUntilNext,
      isOnPeriod
    };
  };

  const todayInfo = getTodayInfo();

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'menstrual':
        return colors.period;
      case 'follicular':
        return colors.fertile;
      case 'ovulation':
        return colors.ovulation;
      case 'luteal':
        return colors.accent;
      default:
        return colors.textSecondary;
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'menstrual':
        return <Droplets size={16} />;
      case 'follicular':
        return <TrendingUp size={16} />;
      case 'ovulation':
        return <Target size={16} />;
      case 'luteal':
        return <Heart size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  return (
    <Card className="shadow-lg border-0 mb-6" style={{ backgroundColor: colors.surface }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: colors.text }}>
          <Calendar size={20} />
          {t('todayWidget')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Cycle Day */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
              {t('cycleDay')}
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              {todayInfo.cycleDay}
            </div>
          </div>

          {/* Current Phase */}
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
              {t('currentPhase')}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Badge 
                className="text-xs px-2 py-1 flex items-center gap-1"
                style={{ 
                  backgroundColor: getPhaseColor(todayInfo.phase) + '20',
                  color: getPhaseColor(todayInfo.phase),
                  border: `1px solid ${getPhaseColor(todayInfo.phase)}40`
                }}
              >
                {getPhaseIcon(todayInfo.phase)}
                {t(todayInfo.phase)}
              </Badge>
            </div>
          </div>

          {/* Days Until Next Period */}
          <div className="text-center p-3 rounded-lg col-span-2 md:col-span-1" style={{ backgroundColor: colors.background }}>
            <div className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
              {t('nextPeriod')}
            </div>
            <div className="text-lg font-bold" style={{ color: colors.period }}>
              {todayInfo.daysUntilNext} {t('days')}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              {typeof todayInfo.daysUntilNext === 'number' ? t('daysUntilNext') : ''}
            </div>
          </div>
        </div>

        {/* Period Status */}
        {todayInfo.isOnPeriod && (
          <div className="mt-4 p-3 rounded-lg text-center" style={{ backgroundColor: colors.period + '20' }}>
            <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: colors.period }}>
              <Droplets size={16} />
              {t('periodInProgress')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayWidget;