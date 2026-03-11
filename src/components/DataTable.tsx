import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import type { Entry } from '../types';

interface DataTableProps {
    entries: Entry[];
    onEdit: (entry: Entry) => void;
    onDelete: (id: string) => void;
}

type SortField = keyof Entry;
type SortOrder = 'asc' | 'desc';

export function DataTable({ entries, onEdit, onDelete }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('joiningDate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedEntries = useMemo(() => {
        return [...entries]
            .filter(entry => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    entry.fullName.toLowerCase().includes(searchLower) ||
                    entry.roomNumber.toString().includes(searchLower) ||
                    (entry.phoneNumber && entry.phoneNumber.includes(searchLower))
                );
            })
            .sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                if (aValue === undefined) aValue = '';
                if (bValue === undefined) bValue = '';

                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [entries, searchTerm, sortField, sortOrder]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />;
        return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    if (entries.length === 0) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No entries yet. Add some data above!</p>
            </div>
        );
    }

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary)' }}>Entries ({entries.length})</h2>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search name, room, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '38px', margin: 0 }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            {([
                                ['roomNumber', 'Room'],
                                ['sharing', 'Sharing'],
                                ['fullName', 'Name'],
                                ['phoneNumber', 'Phone'],
                                ['joiningDate', 'Joined'],
                                ['isAC', 'AC'],
                                ['advance', 'Advance'],
                                ['rent', 'Rent']
                            ] as [SortField, string][]).map(([field, label]) => (
                                <th
                                    key={field}
                                    onClick={() => handleSort(field)}
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        color: sortField === field ? 'var(--primary)' : 'inherit'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {label}
                                        <SortIcon field={field} />
                                    </div>
                                </th>
                            ))}
                            <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedEntries.map((entry) => (
                            <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>#{entry.roomNumber}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{entry.sharing}</td>
                                <td style={{ padding: '12px' }}>{entry.fullName}</td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{entry.phoneNumber || '-'}</td>
                                <td style={{ padding: '12px' }}>{entry.joiningDate || '-'}</td>
                                <td style={{ padding: '12px' }}>
                                    {entry.isAC ? (
                                        <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>AC</span>
                                    ) : (
                                        <span style={{ background: 'var(--background-alt)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Non-AC</span>
                                    )}
                                </td>
                                <td style={{ padding: '12px', color: 'var(--secondary)', fontWeight: '500' }}>
                                    {entry.advance !== undefined ? ('₹' + entry.advance) : '-'}
                                </td>
                                <td style={{ padding: '12px', fontWeight: '600' }}>₹{entry.rent}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button
                                            onClick={() => onEdit(entry)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAndSortedEntries.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No matching entries found.
                    </div>
                )}
            </div>
        </div>
    );
}
