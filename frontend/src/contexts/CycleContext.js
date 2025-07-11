import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [error, setError] = useState(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data concurrently
        const [cyclesResponse, symptomsResponse, notesResponse] = await Promise.all([
          axios.get(`${API}/cycles`),
          axios.get(`${API}/symptoms`),
          axios.get(`${API}/notes`)
        ]);

        setCycles(cyclesResponse.data);
        setSymptoms(symptomsResponse.data);
        setNotes(notesResponse.data);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
        
        // Fallback to localStorage if API fails
        const savedCycles = localStorage.getItem('cycleTracker_cycles');
        const savedSymptoms = localStorage.getItem('cycleTracker_symptoms');
        const savedNotes = localStorage.getItem('cycleTracker_notes');

        if (savedCycles) setCycles(JSON.parse(savedCycles));
        if (savedSymptoms) setSymptoms(JSON.parse(savedSymptoms));
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addCycle = async (cycleData) => {
    try {
      const response = await axios.post(`${API}/cycles`, cycleData);
      setCycles(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error adding cycle:', error);
      throw new Error('Failed to add cycle');
    }
  };

  const updateCycle = async (id, updates) => {
    try {
      const response = await axios.put(`${API}/cycles/${id}`, updates);
      setCycles(prev => prev.map(cycle => 
        cycle.id === id ? response.data : cycle
      ));
      return response.data;
    } catch (error) {
      console.error('Error updating cycle:', error);
      throw new Error('Failed to update cycle');
    }
  };

  const deleteCycle = async (id) => {
    try {
      await axios.delete(`${API}/cycles/${id}`);
      setCycles(prev => prev.filter(cycle => cycle.id !== id));
    } catch (error) {
      console.error('Error deleting cycle:', error);
      throw new Error('Failed to delete cycle');
    }
  };

  const addSymptom = async (symptomData) => {
    try {
      const response = await axios.post(`${API}/symptoms`, symptomData);
      setSymptoms(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error adding symptom:', error);
      throw new Error('Failed to add symptom');
    }
  };

  const deleteSymptom = async (id) => {
    try {
      await axios.delete(`${API}/symptoms/${id}`);
      setSymptoms(prev => prev.filter(symptom => symptom.id !== id));
    } catch (error) {
      console.error('Error deleting symptom:', error);
      throw new Error('Failed to delete symptom');
    }
  };

  const addNote = async (noteData) => {
    try {
      const response = await axios.post(`${API}/notes`, noteData);
      setNotes(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error('Failed to add note');
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API}/notes/${id}`);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
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
    error,
    addCycle,
    updateCycle,
    deleteCycle,
    addSymptom,
    deleteSymptom,
    addNote,
    deleteNote,
    getPredictions
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
};