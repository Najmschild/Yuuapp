import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Heart, Droplets } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import TodayWidget from './TodayWidget';

const CalendarView = () => {
  const { cycles, symptoms, notes, getPredictions } = useCycle();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const predictions = getPredictions();

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getDateInfo = (date) => {
    if (!date) return null;
    
    const dateStr = date.toISOString().split('T')[0];
    const cycleInfo = cycles.find(cycle => {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      return date >= start && date <= end;
    });
    
    const symptomInfo = symptoms.find(symptom => symptom.date === dateStr);
    const noteInfo = notes.find(note => note.date === dateStr);
    
    let prediction = null;
    if (predictions) {
      const dateTime = date.getTime();
      const nextPeriod = predictions.nextPeriod.getTime();
      const ovulation = predictions.ovulation.getTime();
      const fertileStart = predictions.fertileWindow.start.getTime();
      const fertileEnd = predictions.fertileWindow.end.getTime();
      
      if (Math.abs(dateTime - nextPeriod) < 24 * 60 * 60 * 1000) {
        prediction = 'period';
      } else if (Math.abs(dateTime - ovulation) < 24 * 60 * 60 * 1000) {
        prediction = 'ovulation';
      } else if (dateTime >= fertileStart && dateTime <= fertileEnd) {
        prediction = 'fertile';
      }
    }
    
    return {
      cycle: cycleInfo,
      symptoms: symptomInfo,
      notes: noteInfo,
      prediction
    };
  };

  const getDayStyles = (date) => {
    if (!date) return {};
    
    const info = getDateInfo(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';
    
    if (info?.cycle) {
      backgroundColor = colors.period + '60';
      borderColor = colors.period;
    } else if (info?.prediction === 'ovulation') {
      backgroundColor = colors.ovulation + '60';
      borderColor = colors.ovulation;
    } else if (info?.prediction === 'fertile') {
      backgroundColor = colors.fertile + '60';
      borderColor = colors.fertile;
    } else if (info?.prediction === 'period') {
      backgroundColor = colors.predicted + '60';
      borderColor = colors.predicted;
    }
    
    if (isToday) {
      borderColor = colors.primary;
    }
    
    if (isSelected) {
      backgroundColor = colors.accent + '80';
    }
    
    return {
      backgroundColor,
      borderColor,
      color: colors.text
    };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Today Widget */}
      <TodayWidget />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
            {t('cycleCalendar')}
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {t('trackCycleSubtitle')}
          </p>
        </div>
        <Button
          className="rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          style={{ 
            backgroundColor: colors.primary,
            color: colors.background
          }}
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* Predictions Card */}
      {predictions && (
        <Card className="mb-6 shadow-lg border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Heart size={20} />
              {t('upcomingPredictions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {t('nextPeriod')}
                </div>
                <div className="text-lg font-bold" style={{ color: colors.period }}>
                  {predictions.nextPeriod.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {t('ovulation')}
                </div>
                <div className="text-lg font-bold" style={{ color: colors.ovulation }}>
                  {predictions.ovulation.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {t('avgCycle')}
                </div>
                <div className="text-lg font-bold" style={{ color: colors.fertile }}>
                  {predictions.avgCycleLength} {t('days')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
              {formatDate(currentDate)}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="rounded-full hover:scale-105 transition-transform"
                style={{ 
                  borderColor: colors.accent,
                  color: colors.text
                }}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="rounded-full hover:scale-105 transition-transform"
                style={{ 
                  borderColor: colors.accent,
                  color: colors.text
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div 
                key={day}
                className="text-center p-2 text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="aspect-square" />;
              }
              
              const info = getDateInfo(date);
              const dayStyles = getDayStyles(date);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className="aspect-square flex flex-col items-center justify-center p-1 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md relative"
                  style={dayStyles}
                >
                  <span className="text-sm font-medium">
                    {date.getDate()}
                  </span>
                  
                  {/* Indicators */}
                  <div className="flex gap-1 mt-1">
                    {info?.symptoms && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: colors.accent }}
                      />
                    )}
                    {info?.notes && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: colors.text }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: colors.period + '60',
                  borderColor: colors.period
                }}
              />
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                Period
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: colors.fertile + '60',
                  borderColor: colors.fertile
                }}
              />
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                Fertile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: colors.ovulation + '60',
                  borderColor: colors.ovulation
                }}
              />
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                Ovulation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: colors.predicted + '60',
                  borderColor: colors.predicted
                }}
              />
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                Predicted
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="mt-6 shadow-lg border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Droplets size={20} />
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const info = getDateInfo(selectedDate);
              
              if (!info?.cycle && !info?.symptoms && !info?.notes && !info?.prediction) {
                return (
                  <p className="text-center py-4" style={{ color: colors.textSecondary }}>
                    No data for this date
                  </p>
                );
              }
              
              return (
                <div className="space-y-4">
                  {info?.cycle && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
                        Period Day
                      </h4>
                      <Badge style={{ backgroundColor: colors.period + '20', color: colors.period }}>
                        {info.cycle.flow} flow
                      </Badge>
                    </div>
                  )}
                  
                  {info?.prediction && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
                        Prediction
                      </h4>
                      <Badge style={{ backgroundColor: colors.predicted + '20', color: colors.predicted }}>
                        {info.prediction}
                      </Badge>
                    </div>
                  )}
                  
                  {info?.symptoms && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
                        Symptoms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {info.symptoms.symptoms.map((symptom, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            style={{ 
                              borderColor: colors.accent,
                              color: colors.text
                            }}
                          >
                            {symptom.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {info?.notes && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
                        Notes
                      </h4>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {info.notes.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarView;