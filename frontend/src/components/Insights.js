import React from 'react';
import { TrendingUp, Calendar, Heart, MessageSquare, Droplets, Target } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const Insights = () => {
  const { cycles, symptoms, notes, getPredictions } = useCycle();
  const { colors } = useTheme();
  const predictions = getPredictions();

  const getInsights = () => {
    if (cycles.length === 0) return null;

    const sortedCycles = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const totalCycles = cycles.length;
    const avgCycleLength = cycles.reduce((sum, cycle) => sum + (cycle.length || 28), 0) / totalCycles;
    
    // Flow analysis
    const flowCounts = cycles.reduce((acc, cycle) => {
      acc[cycle.flow] = (acc[cycle.flow] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonFlow = Object.entries(flowCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium';

    // Symptom analysis
    const allSymptoms = symptoms.flatMap(s => s.symptoms);
    const symptomCounts = allSymptoms.reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {});
    
    const topSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom, count]) => ({ symptom, count }));

    // Cycle regularity
    const cycleLengths = cycles.map(c => c.length || 28);
    const minLength = Math.min(...cycleLengths);
    const maxLength = Math.max(...cycleLengths);
    const lengthVariation = maxLength - minLength;
    
    const regularity = lengthVariation <= 7 ? 'Regular' : lengthVariation <= 14 ? 'Somewhat Irregular' : 'Irregular';

    return {
      totalCycles,
      avgCycleLength: Math.round(avgCycleLength),
      mostCommonFlow,
      topSymptoms,
      regularity,
      lengthVariation,
      minLength,
      maxLength
    };
  };

  const insights = getInsights();

  if (!insights) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.textSecondary }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            No Insights Yet
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Start logging your cycles to see personalized insights and trends
          </p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Cycles Tracked',
      value: insights.totalCycles,
      icon: Calendar,
      color: colors.primary
    },
    {
      title: 'Average Cycle Length',
      value: `${insights.avgCycleLength} days`,
      icon: Target,
      color: colors.fertile
    },
    {
      title: 'Most Common Flow',
      value: insights.mostCommonFlow,
      icon: Droplets,
      color: colors.period
    },
    {
      title: 'Cycle Regularity',
      value: insights.regularity,
      icon: TrendingUp,
      color: colors.ovulation
    }
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          Health Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Understand your cycle patterns and health trends
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index} className="shadow-lg border-0" style={{ backgroundColor: colors.surface }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
                    {stat.value}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Analysis */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Calendar size={20} />
              Cycle Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  Cycle Length Range
                </span>
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  {insights.minLength} - {insights.maxLength} days
                </span>
              </div>
              <Progress 
                value={100 - (insights.lengthVariation / 21) * 100} 
                className="h-2"
              />
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                {insights.lengthVariation <= 7 ? 'Very regular cycles' : 
                 insights.lengthVariation <= 14 ? 'Moderately regular cycles' : 'Variable cycle lengths'}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                Flow Patterns
              </h4>
              <div className="space-y-2">
                {['light', 'medium', 'heavy'].map(flow => {
                  const count = cycles.filter(c => c.flow === flow).length;
                  const percentage = (count / cycles.length) * 100;
                  return (
                    <div key={flow} className="flex items-center justify-between">
                      <span className="text-sm capitalize" style={{ color: colors.text }}>
                        {flow}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: colors.period
                            }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: colors.textSecondary }}>
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms Insights */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Heart size={20} />
              Symptom Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                Most Common Symptoms
              </h4>
              <div className="space-y-3">
                {insights.topSymptoms.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: colors.accent,
                        color: colors.text
                      }}
                    >
                      {item.symptom.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      {item.count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                Symptom Tracking
              </h4>
              <div className="text-center py-4">
                <div className="text-3xl font-bold" style={{ color: colors.accent }}>
                  {symptoms.length}
                </div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  Total symptom entries
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions */}
        {predictions && (
          <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
                <Target size={20} />
                Upcoming Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <div>
                    <div className="font-medium" style={{ color: colors.text }}>
                      Next Period
                    </div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      Expected start date
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: colors.period }}>
                      {predictions.nextPeriod.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs" style={{ color: colors.textSecondary }}>
                      {Math.ceil((predictions.nextPeriod - new Date()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <div>
                    <div className="font-medium" style={{ color: colors.text }}>
                      Ovulation
                    </div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      Most fertile day
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: colors.ovulation }}>
                      {predictions.ovulation.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs" style={{ color: colors.textSecondary }}>
                      {Math.ceil((predictions.ovulation - new Date()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Summary */}
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <MessageSquare size={20} />
              Notes Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold mb-2" style={{ color: colors.accent }}>
                {notes.length}
              </div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                Total notes written
              </div>
            </div>
            
            {notes.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
                  Recent Note
                </h4>
                <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {notes[notes.length - 1]?.content}
                  </p>
                  <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                    {new Date(notes[notes.length - 1]?.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;