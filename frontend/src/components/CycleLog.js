import React, { useState } from 'react';
import { Calendar, Plus, Droplets, Heart, MessageSquare, Save } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const CycleLog = () => {
  const { addCycle, addSymptom, addNote } = useCycle();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('period');
  const [formData, setFormData] = useState({
    period: {
      startDate: '',
      endDate: '',
      flow: 'medium'
    },
    symptoms: {
      date: new Date().toISOString().split('T')[0],
      symptoms: [],
      intensity: 'mild'
    },
    notes: {
      date: new Date().toISOString().split('T')[0],
      content: ''
    }
  });

  const symptomOptions = [
    { id: 'cramps', label: t('cramps') },
    { id: 'headache', label: t('headache') },
    { id: 'bloating', label: t('bloating') },
    { id: 'mood_swings', label: t('mood_swings') },
    { id: 'fatigue', label: t('fatigue') },
    { id: 'tender_breasts', label: t('tender_breasts') },
    { id: 'acne', label: t('acne') },
    { id: 'cravings', label: t('cravings') },
    { id: 'back_pain', label: t('back_pain') },
    { id: 'nausea', label: t('nausea') }
  ];

  const tabs = [
    { id: 'period', label: t('logPeriod'), icon: Droplets },
    { id: 'symptoms', label: t('logSymptoms'), icon: Heart },
    { id: 'notes', label: t('dailyNotes'), icon: MessageSquare }
  ];

  const handleInputChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };

  const handleSymptomToggle = (symptomId) => {
    const currentSymptoms = formData.symptoms.symptoms;
    const isSelected = currentSymptoms.includes(symptomId);
    
    if (isSelected) {
      handleInputChange('symptoms', 'symptoms', currentSymptoms.filter(s => s !== symptomId));
    } else {
      handleInputChange('symptoms', 'symptoms', [...currentSymptoms, symptomId]);
    }
  };

  const handleSubmit = async (tab) => {
    try {
      switch (tab) {
        case 'period':
          if (!formData.period.startDate) {
            toast.error('Please select a start date');
            return;
          }
          const cycleLength = formData.period.endDate 
            ? Math.ceil((new Date(formData.period.endDate) - new Date(formData.period.startDate)) / (1000 * 60 * 60 * 24)) + 1
            : 28;
          
          await addCycle({
            ...formData.period,
            length: cycleLength
          });
          
          setFormData(prev => ({
            ...prev,
            period: { startDate: '', endDate: '', flow: 'medium' }
          }));
          toast.success('Period logged successfully!');
          break;
          
        case 'symptoms':
          if (formData.symptoms.symptoms.length === 0) {
            toast.error('Please select at least one symptom');
            return;
          }
          
          await addSymptom(formData.symptoms);
          setFormData(prev => ({
            ...prev,
            symptoms: { date: new Date().toISOString().split('T')[0], symptoms: [], intensity: 'mild' }
          }));
          toast.success('Symptoms logged successfully!');
          break;
          
        case 'notes':
          if (!formData.notes.content.trim()) {
            toast.error('Please add a note');
            return;
          }
          
          await addNote(formData.notes);
          setFormData(prev => ({
            ...prev,
            notes: { date: new Date().toISOString().split('T')[0], content: '' }
          }));
          toast.success('Note saved successfully!');
          break;
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          Log Your Cycle
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Record your period, symptoms, and daily notes
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: colors.surface }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200 ${
              activeTab === id ? 'shadow-md transform scale-105' : ''
            }`}
            style={{
              backgroundColor: activeTab === id ? colors.background : 'transparent',
              color: activeTab === id ? colors.primary : colors.textSecondary
            }}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Period Tab */}
      {activeTab === 'period' && (
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Droplets size={20} />
              Log Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" style={{ color: colors.text }}>
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.period.startDate}
                  onChange={(e) => handleInputChange('period', 'startDate', e.target.value)}
                  className="mt-1"
                  style={{ borderColor: colors.accent }}
                />
              </div>
              <div>
                <Label htmlFor="endDate" style={{ color: colors.text }}>
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.period.endDate}
                  onChange={(e) => handleInputChange('period', 'endDate', e.target.value)}
                  className="mt-1"
                  style={{ borderColor: colors.accent }}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="flow" style={{ color: colors.text }}>
                Flow Intensity
              </Label>
              <Select
                value={formData.period.flow}
                onValueChange={(value) => handleInputChange('period', 'flow', value)}
              >
                <SelectTrigger className="mt-1" style={{ borderColor: colors.accent }}>
                  <SelectValue placeholder="Select flow intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={() => handleSubmit('period')}
              className="w-full py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.background
              }}
            >
              <Save size={20} className="mr-2" />
              Save Period
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Symptoms Tab */}
      {activeTab === 'symptoms' && (
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Heart size={20} />
              Log Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="symptomDate" style={{ color: colors.text }}>
                Date
              </Label>
              <Input
                id="symptomDate"
                type="date"
                value={formData.symptoms.date}
                onChange={(e) => handleInputChange('symptoms', 'date', e.target.value)}
                className="mt-1"
                style={{ borderColor: colors.accent }}
              />
            </div>
            
            <div>
              <Label style={{ color: colors.text }}>
                Symptoms
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {symptomOptions.map((symptom) => (
                  <div
                    key={symptom.id}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      formData.symptoms.symptoms.includes(symptom.id) ? 'shadow-md' : ''
                    }`}
                    style={{
                      backgroundColor: formData.symptoms.symptoms.includes(symptom.id) 
                        ? colors.accent + '20' 
                        : colors.background,
                      borderColor: formData.symptoms.symptoms.includes(symptom.id) 
                        ? colors.accent 
                        : colors.accent + '40'
                    }}
                    onClick={() => handleSymptomToggle(symptom.id)}
                  >
                    <Checkbox
                      id={symptom.id}
                      checked={formData.symptoms.symptoms.includes(symptom.id)}
                      readOnly
                    />
                    <Label
                      htmlFor={symptom.id}
                      className="cursor-pointer"
                      style={{ color: colors.text }}
                    >
                      {symptom.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="intensity" style={{ color: colors.text }}>
                Intensity
              </Label>
              <Select
                value={formData.symptoms.intensity}
                onValueChange={(value) => handleInputChange('symptoms', 'intensity', value)}
              >
                <SelectTrigger className="mt-1" style={{ borderColor: colors.accent }}>
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={() => handleSubmit('symptoms')}
              className="w-full py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.background
              }}
            >
              <Save size={20} className="mr-2" />
              Save Symptoms
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <Card className="shadow-xl border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <MessageSquare size={20} />
              Daily Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="noteDate" style={{ color: colors.text }}>
                Date
              </Label>
              <Input
                id="noteDate"
                type="date"
                value={formData.notes.date}
                onChange={(e) => handleInputChange('notes', 'date', e.target.value)}
                className="mt-1"
                style={{ borderColor: colors.accent }}
              />
            </div>
            
            <div>
              <Label htmlFor="noteContent" style={{ color: colors.text }}>
                Your Note
              </Label>
              <Textarea
                id="noteContent"
                placeholder="How are you feeling today? Any observations about your cycle, mood, or wellness..."
                value={formData.notes.content}
                onChange={(e) => handleInputChange('notes', 'content', e.target.value)}
                className="mt-1 min-h-[120px] resize-none"
                style={{ borderColor: colors.accent }}
              />
            </div>
            
            <Button
              onClick={() => handleSubmit('notes')}
              className="w-full py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.background
              }}
            >
              <Save size={20} className="mr-2" />
              Save Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CycleLog;