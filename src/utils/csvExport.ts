import type { Entry } from '../types';

export const exportToCSV = (entries: Entry[], filename = 'radheya_nest_entries.csv') => {
    if (entries.length === 0) return;

    const headers = ['Room Number', 'Sharing', 'Full Name', 'Phone Number', 'Joining Day', 'Advance', 'Rent'];

    const csvContent = [
        headers.join(','),
        ...entries.map(e => [
            e.roomNumber,
            e.sharing,
            `"${e.fullName}"`, // Escape quotes inside names if necessary
            e.phoneNumber || '',
            e.joiningDate,
            e.advance || '',
            e.rent
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create object URL and download link
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
