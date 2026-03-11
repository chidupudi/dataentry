import { useState, useEffect } from 'react';
import { Download, Building2 } from 'lucide-react';
import { DataEntryForm } from './components/DataEntryForm';
import { DataTable } from './components/DataTable';
import { exportToCSV } from './utils/csvExport';
import type { Entry } from './types';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Firestore reference
  const entriesCollection = collection(db, 'tenants');

  // Load from Firestore on mount and setup real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(entriesCollection, (snapshot) => {
      const data: Entry[] = [];
      snapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id } as Entry);
      });
      setEntries(data);
      setIsLoaded(true);
    }, (error) => {
      console.error("Failed to fetch data from Firestore:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEntry = async (newEntryData: Omit<Entry, 'id'>) => {
    try {
      const newId = crypto.randomUUID();
      const newEntry: Entry = { ...newEntryData, id: newId };
      const docRef = doc(entriesCollection, newId);
      await setDoc(docRef, newEntry);
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Failed to add entry");
    }
  };

  const handleUpdateEntry = async (updatedEntry: Entry) => {
    try {
      const docRef = doc(entriesCollection, updatedEntry.id);
      await setDoc(docRef, updatedEntry);
      setEditingEntry(null);
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        const docRef = doc(entriesCollection, id);
        await deleteDoc(docRef);
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert("Failed to delete entry");
      }
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
  };

  const handleExportCSV = () => {
    exportToCSV(entries);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary)',
            padding: '10px',
            borderRadius: '12px',
            color: 'white',
            display: 'flex'
          }}>
            <Building2 size={28} />
          </div>
          <div>
            <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '2rem' }}>Radheya Nest</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
              Tenant Management System
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            disabled={entries.length === 0 || !isLoaded}
            title={entries.length === 0 ? "No data to export" : "Export to CSV"}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <main>
        {!isLoaded ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading data from database...
          </div>
        ) : (
          <>
            <DataEntryForm
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              editingEntry={editingEntry}
              onCancelEdit={() => setEditingEntry(null)}
            />
            <DataTable
              entries={entries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </>
        )}
      </main>

    </div>
  );
}

export default App;
