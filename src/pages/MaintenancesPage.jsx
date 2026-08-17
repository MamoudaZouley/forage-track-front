import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import * as XLSX from 'xlsx';

function ResultBadge({ result }) {
    const config = {
        fully_working: { label: 'Fonctionnel', color: '#E8F8EF', text: '#27AE60' },
        partially_working: { label: 'Partiel', color: '#FEF3E7', text: '#E67E22' },
        not_working: { label: 'En panne', color: '#FDECEC', text: '#E74C3C' },
    };
    const c = config[result] || { label: result || '—', color: '#F5F5F5', text: '#555' };
    return (
        <span className="badge rounded-pill"
              style={{ backgroundColor: c.color, color: c.text, fontSize: '11px' }}>
            {c.label}
        </span>
    );
}

function TypeBadge({ type }) {
    const config = {
        emergency: { label: 'Urgence', color: '#FDECEC', text: '#C0392B' },
        preventive: { label: 'Préventive', color: '#EAF3FB', text: '#1F4E79' },
        corrective: { label: 'Corrective', color: '#FEF3E7', text: '#E67E22' },
    };
    const c = config[type] || { label: type || '—', color: '#F5F5F5', text: '#555' };
    return (
        <span className="badge rounded-pill"
              style={{ backgroundColor: c.color, color: c.text, fontSize: '11px' }}>
            {c.label}
        </span>
    );
}

export default function MaintenancesPage() {
    const [maintenances, setMaintenances] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        region: '', maintenance_type: '', final_result: '', search: ''
    });
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);

    const fetchMaintenances = (p = 1, f = filters) => {
        setLoading(true);
        api.get('/maintenances', { params: { page: p, ...f } })
            .then(res => {
                setMaintenances(res.data.data);
                setMeta(res.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMaintenances(); }, []);

    const handleFilter = (e) => {
        e.preventDefault();
        setPage(1);
        fetchMaintenances(1, filters);
    };

    const handleReset = () => {
        const reset = { region: '', maintenance_type: '', final_result: '', search: '' };
        setFilters(reset);
        setPage(1);
        fetchMaintenances(1, reset);
    };
    

    

    const handleExport = async () => {
        try {
            const response = await api.get('/maintenances/export-data', {
                params: {
                    region: filters.region,
                    maintenance_type: filters.maintenance_type,
                    final_result: filters.final_result,
                    search: filters.search,
                }
            });

            const typeLabels = {
                emergency: 'Urgence', repair: 'Réparation',
                replacement: 'Remplacement', scheduled: 'Planifié',
                inspection: 'Inspection',
            };
            const resultLabels = {
                fully_working: 'Fonctionnel', partially_working: 'Partiel',
                not_working: 'En panne', needs_parts: 'Pièces requises',
                needs_specialist: 'Spécialiste requis', not_repairable: 'Non réparable',
            };
            const technicianNames = {
                mauntaka: 'Maman Mountaka Abdou',
                gambouplumbe: 'Gambo Harou',
                maint_water_well_01: 'Ibrahim Noura',
                pro_m: 'Mahamadou Adamou',
            };
            const workLabels = {
                pump_replacement: 'Remplacement pompe',
                controller_replacement: 'Remplacement contrôleur',
                solar_repair: 'Réparation panneau solaire',
                pipe_repair: 'Réparation tuyaux',
                tank_repair: 'Réparation cuve',
                tap_repair: 'Réparation robinets',
                electrical_repair: 'Réparation électrique',
                robinet: 'Remplacement robinets',
                other: 'Autre',
            };

            const translateWork = (work) => {
                if (!work) return '—';
                return work.split(' ').map(p => workLabels[p] || p).join(', ');
            };

            const rows = response.data.map((m, i) => ({
                '#': i + 1,
                'Date': m.visit_date,
                'Village': m.village || '—',
                'Région': m.region || '—',
                'Code puits': m.well_code || '—',
                'Technicien': technicianNames[m.technician_username] || m.technician_username || '—',
                'Chef équipe': m.team_leader_name || '—',
                'Type': typeLabels[m.maintenance_type] || m.maintenance_type || '—',
                'Travaux effectués': translateWork(m.work_performed),
                'Description': (m.work_description || '—').replace(/\t/g, ' '),
                'Durée (h)': m.work_duration || '—',
                'Pompe avant': m.pump_condition_before || '—',
                'Pompe après': m.pump_condition_after || '—',
                'Débit avant': m.water_flow_before || '—',
                'Débit après': m.water_flow_after || '—',
                'Résultat': resultLabels[m.final_result] || m.final_result || '—',
                'Suivi requis': m.needs_followup ? 'Oui' : 'Non',
                'Observations': (m.observations || '—').replace(/\t/g, ' '),
            }));

            const ws = XLSX.utils.json_to_sheet(rows);

            // Style entêtes
            const headerStyle = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '1F4E79' } },
                alignment: { horizontal: 'center', wrapText: true },
            };

            // Largeur colonnes
            ws['!cols'] = [
                { wch: 4 },  // #
                { wch: 12 }, // Date
                { wch: 20 }, // Village
                { wch: 10 }, // Région
                { wch: 8 },  // Code puits
                { wch: 25 }, // Technicien
                { wch: 25 }, // Chef équipe
                { wch: 12 }, // Type
                { wch: 25 }, // Travaux
                { wch: 50 }, // Description
                { wch: 8 },  // Durée
                { wch: 12 }, // Pompe avant
                { wch: 12 }, // Pompe après
                { wch: 12 }, // Débit avant
                { wch: 12 }, // Débit après
                { wch: 15 }, // Résultat
                { wch: 10 }, // Suivi
                { wch: 50 }, // Observations
            ];

            // Hauteur ligne entête
            ws['!rows'] = [{ hpt: 30 }];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Maintenances');
            XLSX.writeFile(wb, `Maintenances_${new Date().toISOString().slice(0, 10)}.xlsx`);

        } catch (error) {
            console.error('Erreur export:', error);
        }
    };
    
    return (
        <Layout>
           <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0" style={{ color: '#1F4E79' }}>
                    Maintenances
                    {meta && (
                        <span className="badge ms-2 rounded-pill"
                            style={{ backgroundColor: '#EAF3FB', color: '#1F4E79', fontSize: '13px' }}>
                            {meta.total} interventions
                        </span>
                    )}
                </h4>
                <button onClick={handleExport} className="btn text-white"
                        style={{ backgroundColor: '#27AE60' }}>
                    ⬇ Exporter Excel
                </button>
            </div>

            {/* Filtres */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <form className="row g-2 align-items-end" onSubmit={handleFilter}>
                        <div className="col-md-2">
                            <label className="form-label small mb-1">Région</label>
                            <select className="form-select form-select-sm"
                                    value={filters.region}
                                    onChange={e => setFilters({ ...filters, region: e.target.value })}>
                                <option value="">Toutes</option>
                                <option value="MARADI">Maradi</option>
                                <option value="ZINDER">Zinder</option>
                            </select>
                            
                        </div>
                        
                        <div className="col-md-2">
                            <label className="form-label small mb-1">Type</label>
                            <select className="form-select form-select-sm"
                                    value={filters.maintenance_type}
                                    onChange={e => setFilters({ ...filters, maintenance_type: e.target.value })}>
                                <option value="">Tous</option>
                                <option value="emergency">Urgence</option>
                                <option value="preventive">Préventive</option>
                                <option value="corrective">Corrective</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small mb-1">Résultat</label>
                            <select className="form-select form-select-sm"
                                    value={filters.final_result}
                                    onChange={e => setFilters({ ...filters, final_result: e.target.value })}>
                                <option value="">Tous</option>
                                <option value="fully_working">Fonctionnel</option>
                                <option value="partially_working">Partiel</option>
                                <option value="not_working">En panne</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small mb-1">Recherche</label>
                            <input type="text"
                                   className="form-control form-control-sm"
                                   placeholder="Code puits, village, technicien..."
                                   value={filters.search}
                                   onChange={e => setFilters({ ...filters, search: e.target.value })} />
                        </div>
                        <div className="col-md-2 d-flex gap-2">
                            <button type="submit" className="btn btn-sm text-white w-100"
                                    style={{ backgroundColor: '#1F4E79' }}>
                                Filtrer
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={handleReset}>✕</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="row g-3">
                {/* Liste */}
                <div className={selected ? 'col-md-6' : 'col-md-12'}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center p-4">Chargement...</div>
                            ) : (
                                <table className="table table-hover mb-0 small">
                                    <thead style={{ backgroundColor: '#1F4E79' }}>
                                        <tr>
                                            <th className="text-white fw-medium py-3 px-3">Date</th>
                                            <th className="text-white fw-medium">Puits</th>
                                            <th className="text-white fw-medium">Village</th>
                                            <th className="text-white fw-medium">Type</th>
                                            <th className="text-white fw-medium">Technicien</th>
                                            <th className="text-white fw-medium">Résultat</th>
                                            <th className="text-white fw-medium">Détail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenances.map((m, i) => (
                                            <tr key={m.id}
                                                style={{ backgroundColor: i % 2 === 0 ? '#F9F9F9' : '#fff' }}>
                                                <td className="px-3">
                                                    {new Date(m.visit_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="fw-medium" style={{ color: '#1F4E79' }}>
                                                    {m.well_code}
                                                </td>
                                                <td>{m.village}</td>
                                                <td><TypeBadge type={m.maintenance_type} /></td>
                                                <td>{m.technician_username}</td>
                                                <td><ResultBadge result={m.final_result} /></td>
                                                <td>
                                                    <button
                                                        onClick={() => setSelected(selected?.id === m.id ? null : m)}
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: '#1F4E79', fontSize: '11px' }}>
                                                        {selected?.id === m.id ? '✕' : 'Voir →'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="card-footer bg-white d-flex justify-content-between align-items-center small">
                                <span className="text-muted">{meta.from}–{meta.to} sur {meta.total}</span>
                                <div className="d-flex gap-1">
                                    {Array.from({ length: Math.min(meta.last_page, 10) }, (_, i) => i + 1).map(p => (
                                        <button key={p}
                                                onClick={() => { setPage(p); fetchMaintenances(p); }}
                                                className="btn btn-sm"
                                                style={{
                                                    backgroundColor: p === meta.current_page ? '#1F4E79' : '#F5F5F5',
                                                    color: p === meta.current_page ? '#fff' : '#333',
                                                    minWidth: '32px'
                                                }}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Détail */}
                {selected && (
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom d-flex justify-content-between">
                                <span className="fw-medium" style={{ color: '#1F4E79' }}>
                                    Détail — Puits {selected.well_code}
                                </span>
                                <button onClick={() => setSelected(null)}
                                        className="btn btn-sm btn-outline-secondary">✕</button>
                            </div>
                            <div className="card-body small">
                                <table className="table table-sm mb-3">
                                    <tbody>
                                        {[
                                            ['Date', new Date(selected.visit_date).toLocaleDateString('fr-FR')],
                                            ['Village', selected.village],
                                            ['Région', selected.region],
                                            ['Technicien', selected.technician_username],
                                            ['Chef équipe', selected.team_leader_name],
                                            ['Type', selected.maintenance_type],
                                            ['Source', selected.request_source],
                                            ['Durée', selected.work_duration ? `${selected.work_duration}h` : '—'],
                                            ['Pompe avant', selected.pump_condition_before],
                                            ['Pompe après', selected.pump_condition_after],
                                            ['Débit avant', selected.water_flow_before],
                                            ['Débit après', selected.water_flow_after],
                                            ['Résultat', selected.final_result],
                                            ['Suivi requis', selected.needs_followup ? 'Oui' : 'Non'],
                                        ].map(([label, value]) => (
                                            <tr key={label}>
                                                <td className="text-muted" style={{ width: '140px' }}>{label}</td>
                                                <td className="fw-medium">{value || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {selected.work_performed && (
                                    <div className="mb-2">
                                        <div className="text-muted small mb-1">Travaux effectués</div>
                                        <div className="p-2 rounded" style={{ backgroundColor: '#F8F8F7' }}>
                                            {selected.work_performed}
                                        </div>
                                    </div>
                                )}

                                {selected.work_description && (
                                    <div className="mb-2">
                                        <div className="text-muted small mb-1">Description</div>
                                        <div className="p-2 rounded" style={{ backgroundColor: '#F8F8F7' }}>
                                            {selected.work_description}
                                        </div>
                                    </div>
                                )}

                                {selected.observations && (
                                    <div className="mb-2">
                                        <div className="text-muted small mb-1">Observations</div>
                                        <div className="p-2 rounded" style={{ backgroundColor: '#FEF3E7' }}>
                                            {selected.observations}
                                        </div>
                                    </div>
                                )}

                                {selected.well_id && (
                                    <Link to={`/wells/${selected.well_id}`}
                                          className="btn btn-sm text-white mt-2"
                                          style={{ backgroundColor: '#1F4E79' }}>
                                        Voir la fiche du puits →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}