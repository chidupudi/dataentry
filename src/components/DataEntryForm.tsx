import { useState, useEffect, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type { Entry } from '../types';

interface DataEntryFormProps {
    onAddEntry: (entry: Omit<Entry, 'id'>) => void;
    onUpdateEntry: (entry: Entry) => void;
    editingEntry: Entry | null;
    onCancelEdit: () => void;
}

export function DataEntryForm({ onAddEntry, onUpdateEntry, editingEntry, onCancelEdit }: DataEntryFormProps) {
    const [formData, setFormData] = useState({
        roomNumber: '',
        fullName: '',
        phoneNumber: '',
        joiningDate: '',
        sharing: '1',
        advance: '',
        rent: '',
        isAC: false
    });

    // Populate form when editing Entry changes
    useEffect(() => {
        if (editingEntry) {
            setFormData({
                roomNumber: String(editingEntry.roomNumber),
                fullName: editingEntry.fullName,
                phoneNumber: editingEntry.phoneNumber || '',
                joiningDate: editingEntry.joiningDate ? String(editingEntry.joiningDate) : '',
                sharing: String(editingEntry.sharing),
                advance: editingEntry.advance ? String(editingEntry.advance) : '',
                rent: String(editingEntry.rent),
                isAC: editingEntry.isAC || false
            });
        } else {
            // Reset to default
            setFormData({
                roomNumber: '',
                fullName: '',
                phoneNumber: '',
                joiningDate: '',
                sharing: '1',
                advance: '',
                rent: '',
                isAC: false
            });
        }
    }, [editingEntry]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.roomNumber || !formData.fullName || !formData.rent) {
            alert("Please fill in all required fields (Room, Name, Rent)");
            return;
        }

        const entryPayload = {
            roomNumber: Number(formData.roomNumber),
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            joiningDate: formData.joiningDate ? Number(formData.joiningDate) : undefined,
            sharing: Number(formData.sharing),
            advance: formData.advance ? Number(formData.advance) : undefined,
            rent: Number(formData.rent),
            isAC: formData.isAC
        };

        if (editingEntry) {
            onUpdateEntry({ ...entryPayload, id: editingEntry.id });
        } else {
            onAddEntry(entryPayload);
        }

        // Reset form for next entry only if not editing (or we can just reset anyway, but useEffect handles it)
        setFormData(prev => ({
            ...prev,
            roomNumber: '',
            fullName: '',
            phoneNumber: '',
            sharing: '1',
            advance: '',
            isAC: false,
            // Keep joining date and rent as they might be the same
        }));
    };

    return (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                {editingEntry ? 'Edit Entry' : 'New Entry'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                <div>
                    <label htmlFor="roomNumber">Room Number *</label>
                    <input
                        type="number"
                        id="roomNumber"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="joiningDate">Joining Day (1-31)</label>
                    <input
                        type="number"
                        id="joiningDate"
                        name="joiningDate"
                        min="1"
                        max="31"
                        value={formData.joiningDate}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Sharing *</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '12px' }}>
                        {[1, 2, 3, 4].map(num => (
                            <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 400 }}>
                                <input
                                    type="radio"
                                    name="sharing"
                                    value={num}
                                    checked={formData.sharing === String(num)}
                                    onChange={handleChange}
                                    required
                                />
                                {num}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="advance">Advance</label>
                    <input
                        type="number"
                        id="advance"
                        name="advance"
                        value={formData.advance}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <label htmlFor="isAC" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, marginTop: '24px' }}>
                        <input
                            type="checkbox"
                            id="isAC"
                            name="isAC"
                            checked={formData.isAC}
                            onChange={handleChange}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        AC Room
                    </label>
                </div>

                <div>
                    <label htmlFor="rent">Rent *</label>
                    <input
                        type="number"
                        id="rent"
                        name="rent"
                        value={formData.rent}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '10px', gap: '10px' }}>
                    <button type="submit" className="btn" style={{ flex: 1 }}>
                        <Plus size={18} /> {editingEntry ? 'Update Entry' : 'Add Entry'}
                    </button>
                    {editingEntry && (
                        <button type="button" onClick={onCancelEdit} className="btn btn-secondary">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
