import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockData } from '../services/mockData';

const CycleContext = createContext();

export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};

export const CycleProvider = ({ children }) => {
  const [cycles, setCycles] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage or use mock data
    const savedCycles = localStorage.getItem('cycleTracker_cycles');
    const savedSymptoms = localStorage.getItem('cycleTracker_symptoms');
    const savedNotes = localStorage.getItem('cycleTracker_notes');

    if (savedCycles) {
      setCycles(JSON.parse(savedCycles));
    } else {
      setCycles(mockData.cycles);
    }

    if (savedSymptoms) {
      setSymptoms(JSON.parse(savedSymptoms));
    } else {
      setSymptoms(mockData.symptoms);
    }

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      setNotes(mockData.notes);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cycleTracker_cycles', JSON.stringify(cycles));
    }
  }, [cycles, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cycleTracker_symptoms', JSON.stringify(symptoms));
    }
  }, [symptoms, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cycleTracker_notes', JSON.stringify(notes));
    }
  }, [notes, loading]);

  const addCycle = (cycleData) => {
    const newCycle = {
      id: Date.now().toString(),
      ...cycleData,
      createdAt: new Date().toISOString()
    };
    setCycles(prev => [...prev, newCycle]);
  };

  const updateCycle = (id, updates) => {
    setCycles(prev => prev.map(cycle => 
      cycle.id === id ? { ...cycle, ...updates } : cycle
    ));
  };

  const addSymptom = (symptomData) => {
    const newSymptom = {
      id: Date.now().toString(),
      ...symptomData,
      createdAt: new Date().toISOString()
    };
    setSymptoms(prev => [...prev, newSymptom]);
  };

  const addNote = (noteData) => {
    const newNote = {
      id: Date.now().toString(),
      ...noteData,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [...prev, newNote]);
  };

  const getPredictions = () => {
    if (cycles.length === 0) return null;

    const sortedCycles = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const lastCycle = sortedCycles[sortedCycles.length - 1];
    
    // Calculate average cycle length
    const avgCycleLength = cycles.reduce((sum, cycle) => sum + (cycle.length || 28), 0) / cycles.length;
    
    const nextPeriodDate = new Date(lastCycle.startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(avgCycleLength));
    
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    return {
      nextPeriod: nextPeriodDate,
      ovulation: ovulationDate,
      fertileWindow: { start: fertileStart, end: fertileEnd },
      avgCycleLength: Math.round(avgCycleLength)
    };
  };

  const value = {
    cycles,
    symptoms,
    notes,
    loading,
    addCycle,
    updateCycle,
    addSymptom,
    addNote,
    getPredictions
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
};