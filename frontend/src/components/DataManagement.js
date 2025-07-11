import React, { useState } from 'react';
import { Trash2, Calendar, Heart, MessageSquare, AlertTriangle } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner';

const DataManagement = () => {
  const { cycles, symptoms, notes, deleteCycle, deleteSymptom, deleteNote } = useCycle();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('cycles');

  const handleDeleteCycle = async (cycleId) => {
    try {
      await deleteCycle(cycleId);
      toast.success('Cycle deleted successfully');
    } catch (error) {
      toast.error('Failed to delete cycle');
    }
  };

  const handleDeleteSymptom = async (symptomId) => {
    try {
      await deleteSymptom(symptomId);
      toast.success('Symptom entry deleted successfully');
    } catch (error) {
      toast.error('Failed to delete symptom entry');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'cycles', label: 'Cycles', icon: Calendar, count: cycles.length },
    { id: 'symptoms', label: 'Symptoms', icon: Heart, count: symptoms.length },
    { id: 'notes', label: 'Notes', icon: MessageSquare, count: notes.length }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: colors.surface }}>
        {tabs.map(({ id, label, icon: Icon, count }) => (
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
            <Badge 
              variant="outline" 
              className="ml-1"
              style={{ 
                borderColor: activeTab === id ? colors.primary : colors.textSecondary,
                color: activeTab === id ? colors.primary : colors.textSecondary
              }}
            >
              {count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Cycles Tab */}
      {activeTab === 'cycles' && (
        <Card className="shadow-lg border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Calendar size={20} />
              Cycle Entries ({cycles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cycles.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.textSecondary }} />
                <p style={{ color: colors.textSecondary }}>No cycles recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map((cycle) => (
                  <div
                    key={cycle.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.accent + '40'
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatDate(cycle.startDate)}
                        </span>
                        {cycle.endDate && (
                          <>
                            <span style={{ color: colors.textSecondary }}>→</span>
                            <span style={{ color: colors.text }}>
                              {formatDate(cycle.endDate)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Badge 
                          style={{ 
                            backgroundColor: colors.period + '20',
                            color: colors.period
                          }}
                        >
                          {cycle.flow} flow
                        </Badge>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: colors.accent,
                            color: colors.text
                          }}
                        >
                          {cycle.length} days
                        </Badge>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            Delete Cycle
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this cycle entry from {formatDate(cycle.startDate)}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCycle(cycle.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Symptoms Tab */}
      {activeTab === 'symptoms' && (
        <Card className="shadow-lg border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <Heart size={20} />
              Symptom Entries ({symptoms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {symptoms.length === 0 ? (
              <div className="text-center py-8">
                <Heart size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.textSecondary }} />
                <p style={{ color: colors.textSecondary }}>No symptoms recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {symptoms.sort((a, b) => new Date(b.date) - new Date(a.date)).map((symptom) => (
                  <div
                    key={symptom.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.accent + '40'
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatDate(symptom.date)}
                        </span>
                        <Badge 
                          style={{ 
                            backgroundColor: colors.fertile + '20',
                            color: colors.fertile
                          }}
                        >
                          {symptom.intensity}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {symptom.symptoms.map((s, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            style={{ 
                              borderColor: colors.accent,
                              color: colors.text
                            }}
                          >
                            {s.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            Delete Symptom Entry
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this symptom entry from {formatDate(symptom.date)}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteSymptom(symptom.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <Card className="shadow-lg border-0" style={{ backgroundColor: colors.surface }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              <MessageSquare size={20} />
              Note Entries ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.textSecondary }} />
                <p style={{ color: colors.textSecondary }}>No notes written yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.sort((a, b) => new Date(b.date) - new Date(a.date)).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.accent + '40'
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold" style={{ color: colors.text }}>
                          {formatDate(note.date)}
                        </span>
                      </div>
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: colors.textSecondary }}
                      >
                        {note.content}
                      </p>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-red-100 transition-colors ml-3"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            Delete Note
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this note from {formatDate(note.date)}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteNote(note.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataManagement;