import { create } from 'zustand';
import { FootprintRecord, FootprintInputs, FootprintResults } from '../types/footprint.types';
import { isMockMode, db } from '../services/firebase/config';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

interface FootprintState {
  records: FootprintRecord[];
  activeRecord: FootprintRecord | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: (uid: string) => Promise<void>;
  saveRecord: (uid: string, inputs: FootprintInputs, results: FootprintResults) => Promise<FootprintRecord>;
  deleteRecord: (uid: string, id: string) => Promise<void>;
  setActiveRecord: (uid: string, id: string) => Promise<void>;
}

// Pre-populated default footprint for Mock Mode
const defaultMockRecord: FootprintRecord = {
  id: 'mock-fp-789',
  calculatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  version: 'IPCC2023v1',
  isActive: true,
  inputs: {
    transport: {
      carKmPerDay: 15,
      carFuelType: 'petrol',
      publicTransportKmPerDay: 12,
      flightsPerYear: 2,
      flightType: 'shortHaul',
      bikeOrWalkKmPerDay: 2
    },
    energy: {
      electricityKwhPerMonth: 220,
      electricitySource: 'grid',
      naturalGasUnitsPerMonth: 0,
      coalUsageKgPerMonth: 0,
      householdSize: 3
    },
    diet: {
      meatMealsPerWeek: 6,
      beefMealsPerWeek: 1,
      dairyServingsPerDay: 2,
      foodWastePercent: 20
    },
    shopping: {
      clothingItemsPerMonth: 2,
      electronicsPerYear: 1,
      onlineOrdersPerWeek: 3
    }
  },
  results: {
    monthly: 275.5,
    annual: 3306.0,
    breakdown: {
      transport: 1682.0,
      energy: 753.0,
      diet: 621.0,
      shopping: 250.0
    },
    nationalAverage: 1900.0, // 1.9 tons per CEA India
    globalAverage: 4700.0,    // 4.7 tons per World Bank
    percentileRank: 74.0       // 74th percentile in India
  }
};

export const useFootprintStore = create<FootprintState>((set, get) => ({
  records: [],
  activeRecord: null,
  loading: true,
  error: null,

  initialize: async (uid) => {
    set({ loading: true });
    
    if (isMockMode) {
      try {
        const stored = localStorage.getItem(`eq_footprints_${uid}`);
        let loaded: FootprintRecord[] = [];
        
        if (stored) {
          loaded = JSON.parse(stored);
        } else {
          // Setup initial mock history
          loaded = [
            {
              ...defaultMockRecord,
              id: 'mock-fp-past-1',
              calculatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: false,
              results: {
                ...defaultMockRecord.results,
                annual: 3620.0,
                monthly: 301.6,
                breakdown: {
                  ...defaultMockRecord.results.breakdown,
                  transport: 1980.0
                }
              }
            },
            defaultMockRecord
          ];
          localStorage.setItem(`eq_footprints_${uid}`, JSON.stringify(loaded));
        }
        
        const active = loaded.find(r => r.isActive) || loaded[loaded.length - 1] || null;
        set({ records: loaded, activeRecord: active, loading: false });
      } catch (err) {
        console.error('Mock footprint initialization failed:', err);
        set({ error: 'Failed to initialize Mock Footprints', loading: false });
      }
    } else {
      try {
        const colRef = collection(db!, 'users', uid, 'footprints');
        const q = query(colRef, orderBy('calculatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loaded: FootprintRecord[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            calculatedAt: data.calculatedAt?.toDate?.()?.toISOString() || data.calculatedAt,
            version: data.version,
            inputs: data.inputs,
            results: data.results,
            isActive: data.isActive
          });
        });
        
        const active = loaded.find(r => r.isActive) || loaded[0] || null;
        set({ records: loaded, activeRecord: active, loading: false });
      } catch (err) {
        console.error('Error loading footprints from Firestore:', err);
        set({ error: 'Failed to retrieve carbon footprints from Firebase', loading: false });
      }
    }
  },

  saveRecord: async (uid, inputs, results) => {
    const { records } = get();
    
    // Set all other records to inactive
    const updatedRecords = records.map(r => ({ ...r, isActive: false }));
    
    const newRecord: FootprintRecord = {
      id: isMockMode ? `fp-${Math.random().toString(36).substr(2, 9)}` : '',
      calculatedAt: new Date().toISOString(),
      version: 'IPCC2023v1',
      isActive: true,
      inputs,
      results
    };

    if (isMockMode) {
      newRecord.id = `fp-${Math.random().toString(36).substr(2, 9)}`;
      const allRecords = [...updatedRecords, newRecord];
      localStorage.setItem(`eq_footprints_${uid}`, JSON.stringify(allRecords));
      set({ records: allRecords, activeRecord: newRecord });
      return newRecord;
    } else {
      try {
        const colRef = collection(db!, 'users', uid, 'footprints');
        const newDocRef = doc(colRef); // Generate auto-ID doc
        newRecord.id = newDocRef.id;
        
        // Write new active footprint
        await setDoc(newDocRef, {
          ...newRecord,
          calculatedAt: new Date()
        });
        
        // Deactivate all other footprints in DB
        for (const record of records) {
          if (record.isActive) {
            const docRef = doc(db!, 'users', uid, 'footprints', record.id);
            await updateDoc(docRef, { isActive: false });
          }
        }
        
        const allRecords = [newRecord, ...updatedRecords]; // sorted desc
        set({ records: allRecords, activeRecord: newRecord });
        return newRecord;
      } catch (err) {
        console.error('Error saving footprint to Firestore:', err);
        throw err;
      }
    }
  },

  deleteRecord: async (uid, id) => {
    const { records, activeRecord } = get();
    const filtered = records.filter(r => r.id !== id);
    
    // If we deleted the active record, select a new active one
    let newActive = activeRecord;
    if (activeRecord?.id === id) {
      if (filtered.length > 0) {
        filtered[0].isActive = true;
        newActive = filtered[0];
      } else {
        newActive = null;
      }
    }

    if (isMockMode) {
      localStorage.setItem(`eq_footprints_${uid}`, JSON.stringify(filtered));
      set({ records: filtered, activeRecord: newActive });
    } else {
      try {
        const docRef = doc(db!, 'users', uid, 'footprints', id);
        await deleteDoc(docRef);
        
        if (newActive) {
          const activeRef = doc(db!, 'users', uid, 'footprints', newActive.id);
          await updateDoc(activeRef, { isActive: true });
        }
        
        set({ records: filtered, activeRecord: newActive });
      } catch (err) {
        console.error('Error deleting footprint record:', err);
        throw err;
      }
    }
  },

  setActiveRecord: async (uid, id) => {
    const { records } = get();
    
    const updated = records.map(r => ({
      ...r,
      isActive: r.id === id
    }));
    
    const active = updated.find(r => r.isActive) || null;

    if (isMockMode) {
      localStorage.setItem(`eq_footprints_${uid}`, JSON.stringify(updated));
      set({ records: updated, activeRecord: active });
    } else {
      try {
        for (const record of records) {
          const docRef = doc(db!, 'users', uid, 'footprints', record.id);
          await updateDoc(docRef, { isActive: record.id === id });
        }
        set({ records: updated, activeRecord: active });
      } catch (err) {
        console.error('Error activating footprint record:', err);
        throw err;
      }
    }
  }
}));
