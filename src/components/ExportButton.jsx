import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExportButton({ data, filename = 'export' }) {
    const [showModal, setShowModal] = useState(false);
    const [period, setPeriod] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filterByPeriod = (items) => {
        const now = new Date();
        let from, to;

        switch (period) {
            case 'week':
                from = new Date(now);
                from.setDate(now.getDate() - 7);
                break;
            case 'month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                from = new Date(now.getFullYear(), 0, 1);
                break;
            case 'custom':
                from = dateFrom ? new Date(dateFrom) : null;
                to = dateTo ? new Date(dateTo) : null;
                break;
            default:
                return items;
        }

        return items.filter(item => {
            const date = new Date(item.last_visit_date || item.visit_date);
            if (from && date < from) return false;
            if (to && date > to) return false;
            return true;
        });
    };

    const prepareRows = () => {
        const filtered = filterByPeriod(data);
        return filtered.map(item => ({
            'Site': item.well_code || '—',
            'Village': item.village || '—',
            'Région': item.region || '—',
            'Dernière visite': item.last_visit_date
                ? new Date(item.last_visit_date).toLocaleDateString('fr-FR')
                : '—',
            'Statut': item.status === 'unresolved' ? 'Non résolu'
                    : item.status === 'resolved' ? 'Résolu'
                    : 'Pas de problème',
            'Alertes': item.alerts_count || 0,
            'Problèmes': (item.alerts || []).map(a => a.issue).join(', ') || '—',
            'Dernière maintenance': item.last_maintenance_date
                ? new Date(item.last_maintenance_date).toLocaleDateString('fr-FR')
                : 'Aucune',
            'Résultat maintenance': item.last_maintenance_result || '—',
        }));
    };

    const exportExcel = () => {
        const rows = prepareRows();
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Alertes');

        // Style colonnes
        ws['!cols'] = [
            { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 8 }, { wch: 40 }, { wch: 18 }, { wch: 15 }
        ];

        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        setShowModal(false);
    };

    const exportPDF = () => {
        const rows = prepareRows();
        const doc = new jsPDF({ orientation: 'landscape' });

        doc.setFontSize(14);
        doc.setTextColor(31, 78, 121);
        doc.text('ForageTrack — Rapport des alertes par site', 14, 15);

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

        autoTable(doc, {
            startY: 27,
            head: [[
                'Site', 'Village', 'Région', 'Dernière visite',
                'Statut', 'Alertes', 'Dernière maint.'
            ]],
            body: rows.map(r => [
                r['Site'], r['Village'], r['Région'],
                r['Dernière visite'], r['Statut'],
                r['Alertes'], r['Dernière maintenance']
            ]),
            headStyles: { fillColor: [31, 78, 121], fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    if (data.cell.raw === 'Non résolu') {
                        data.cell.styles.textColor = [192, 57, 43];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (data.cell.raw === 'Résolu') {
                        data.cell.styles.textColor = [125, 102, 8];
                    } else {
                        data.cell.styles.textColor = [39, 174, 96];
                    }
                }
            },
        });

        // Résumé en bas
        const finalY = doc.lastAutoTable.finalY + 8;
        const filtered = filterByPeriod(data);
        const unresolved = filtered.filter(i => i.status === 'unresolved').length;
        const resolved = filtered.filter(i => i.status === 'resolved').length;
        const noProblem = filtered.filter(i => i.status === 'no_problem').length;

        doc.setFontSize(9);
        doc.setTextColor(31, 78, 121);
        doc.text(`Résumé : ${filtered.length} sites — 🔴 ${unresolved} non résolus — 🟡 ${resolved} résolus — 🟢 ${noProblem} sans problème`, 14, finalY);

        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowModal(false);
    };

    return (
        <>
            <button onClick={() => setShowModal(true)}
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: '#27AE60' }}>
                📥 Exporter
            </button>

            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header text-white border-0"
                                 style={{ backgroundColor: '#1F4E79' }}>
                                <h6 className="modal-title fw-bold">Exporter les données</h6>
                                <button onClick={() => setShowModal(false)}
                                        className="btn-close btn-close-white" />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Période</label>
                                    <select className="form-select form-select-sm"
                                            value={period}
                                            onChange={e => setPeriod(e.target.value)}>
                                        <option value="all">Toutes les données</option>
                                        <option value="week">7 derniers jours</option>
                                        <option value="month">Mois en cours</option>
                                        <option value="year">Année en cours</option>
                                        <option value="custom">Plage personnalisée</option>
                                    </select>
                                </div>

                                {period === 'custom' && (
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small">Du</label>
                                            <input type="date" className="form-control form-control-sm"
                                                   value={dateFrom}
                                                   onChange={e => setDateFrom(e.target.value)} />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Au</label>
                                            <input type="date" className="form-control form-control-sm"
                                                   value={dateTo}
                                                   onChange={e => setDateTo(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info py-2 small">
                                    {filterByPeriod(data).length} sites seront exportés
                                </div>
                            </div>
                            <div className="modal-footer border-0 gap-2">
                                <button onClick={() => setShowModal(false)}
                                        className="btn btn-sm btn-outline-secondary">
                                    Annuler
                                </button>
                                <button onClick={exportExcel}
                                        className="btn btn-sm text-white"
                                        style={{ backgroundColor: '#27AE60' }}>
                                    📊 Excel (.xlsx)
                                </button>
                                <button onClick={exportPDF}
                                        className="btn btn-sm text-white"
                                        style={{ backgroundColor: '#C0392B' }}>
                                    📄 PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}