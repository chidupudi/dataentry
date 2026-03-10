import { useState, useEffect, useRef } from 'react';
import { Download, Upload, FileJson, Building2 } from 'lucide-react';
import { DataEntryForm } from './components/DataEntryForm';
import { DataTable } from './components/DataTable';
import { exportToCSV } from './utils/csvExport';
import type { Entry } from './types';

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local API on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntries(data);
        }
      })
      .catch(e => console.error("Failed to fetch data from local API:", e))
      .finally(() => setIsLoaded(true));
  }, []);

  // Save to local API whenever entries change
  useEffect(() => {
    if (isLoaded) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries)
      }).catch(e => console.error("Failed to save data:", e));
    }
  }, [entries, isLoaded]);

  const handleAddEntry = (newEntryData: Omit<Entry, 'id'>) => {
    const newEntry: Entry = { ...newEntryData, id: crypto.randomUUID() };
    setEntries(prev => [...prev, newEntry]);
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
  };

  const handleExportCSV = () => {
    exportToCSV(entries);
  };

  const handleExportJSON = () => {
    if (entries.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "radheya_nest_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
          alert("Data loaded successfully from file!");
        } else {
          alert("Invalid data format in JSON file.");
        }
      } catch (error) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImportJSON}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            title="Load Data from JSON File"
          >
            <Upload size={18} />
            Load JSON
          </button>
          <button
            onClick={handleExportJSON}
            className="btn btn-secondary"
            disabled={entries.length === 0}
            title={entries.length === 0 ? "No data to export" : "Save Data to JSON File"}
          >
            <FileJson size={18} />
            Save JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            disabled={entries.length === 0}
            title={entries.length === 0 ? "No data to export" : "Export to CSV"}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <main>
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
      </main>

    </div>
  );
}

export default App;
