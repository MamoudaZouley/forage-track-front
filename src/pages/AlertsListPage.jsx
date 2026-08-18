import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import ExportButton from '../components/ExportButton';

function StatusBadge({ status }) {
    const config = {
        unresolved: { label: '🔴 Non résolu', bg: '#FDECEC', color: '#C0392B' },
        resolved: { label: '🟡 Résolu', bg: '#FFFDE7', color: '#7D6608' },
        no_problem: { label: '🟢 Pas de problème', bg: '#E8F8EF', color: '#27AE60' },
    };
    const c = config[status] || config.no_problem;
    return (
        <span className="badge rounded-pill px-2 py-1"
              style={{ backgroundColor: c.bg, color: c.color, fontSize: '11px' }}>
            {c.label}
        </span>
    );
}

function SeverityBadge({ severity }) {
    const config = {
        CRITICAL: { color: '#C0392B', bg: '#FDECEC' },
        HIGH: { color: '#E67E22', bg: '#FEF3E7' },
        MEDIUM: { color: '#7D6608', bg: '#FFFDE7' },
        LOW: { color: '#555', bg: '#F5F5F5' },
    };
    const c = config[severity] || config.LOW;
    return (
        <span className="badge rounded-pill px-2"
              style={{ backgroundColor: c.bg, color: c.color, fontSize: '10px' }}>
            {severity}
        </span>
    );
}

export default function AlertsListPage() {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ region: '', status: '', search: '' });
    const [selected, setSelected] = useState(null);

    const fetchData = (f = filters) => {
        setLoading(true);
        api.get('/alerts/wells-status', { params: f })
            .then(res => {
                setData(res.data.data);
                setStats(res.data.stats);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchData(filters);
    };

    const handleReset = () => {
        const reset = { region: '', status: '', search: '' };
        setFilters(reset);
        fetchData(reset);
    };

    const getDaysColor = (days) => {
        if (days >= 30) return '#C00000';
        if (days >= 14) return '#E67E22';
        if (days >= 7)  return '#F1C40F';
        return '#27AE60';
    };

    const getDaysLabel = (days) => {
        if (days === 0) return "Aujourd'hui";
        if (days === 1) return '1 jour';
        return `${days} jours`;
    };

    const getMaxDaysOpen = (alerts) => {
        const unresolvedDays = alerts
            ?.filter(a => !a.resolved)
            .map(a => a.days_open || 0);
        if (!unresolvedDays || unresolvedDays.length === 0) return 0;
        return Math.max(...unresolvedDays);
    };

    return (
        <Layout>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0" style={{ color: '#1F4E79' }}>
                    Suivi des alertes par site
                </h4>
                <ExportButton data={data} filename="forage_alertes" />
            </div>

            {/* Cartes stats */}
            {stats && (
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="fs-2 fw-bold" style={{ color: '#1F4E79' }}>{stats.total}</div>
                                <div className="text-muted small">Sites suivis</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #C0392B' }}>
                            <div className="card-body text-center">
                                <div className="fs-2 fw-bold text-danger">{stats.unresolved}</div>
                                <div className="text-muted small">🔴 Non résolus</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #F1C40F' }}>
                            <div className="card-body text-center">
                                <div className="fs-2 fw-bold" style={{ color: '#7D6608' }}>{stats.resolved}</div>
                                <div className="text-muted small">🟡 Résolus</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm" style={{ borderLeft: '4px solid #27AE60' }}>
                            <div className="card-body text-center">
                                <div className="fs-2 fw-bold" style={{ color: '#27AE60' }}>{stats.no_problem}</div>
                                <div className="text-muted small">🟢 Pas de problème</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <form className="row g-2 align-items-end" onSubmit={handleFilter}>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Région</label>
                            <select className="form-select form-select-sm"
                                    value={filters.region}
                                    onChange={e => setFilters({ ...filters, region: e.target.value })}>
                                <option value="">Toutes les régions</option>
                                <option value="MARADI">Maradi</option>
                                <option value="ZINDER">Zinder</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Statut</label>
                            <select className="form-select form-select-sm"
                                    value={filters.status}
                                    onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                <option value="">Tous les statuts</option>
                                <option value="unresolved">🔴 Non résolu</option>
                                <option value="resolved">🟡 Résolu</option>
                                <option value="no_problem">🟢 Pas de problème</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small mb-1">Recherche</label>
                            <input type="text"
                                   className="form-control form-control-sm"
                                   placeholder="Code puits ou village..."
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

            {/* Tableau + détail */}
            <div className="row g-3">
                <div className={selected ? 'col-md-7' : 'col-md-12'}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center p-4">Chargement...</div>
                            ) : data.length === 0 ? (
                                <div className="text-center p-4 text-muted">Aucun résultat</div>
                            ) : (
                                <table className="table table-hover mb-0 small">
                                    <thead className="table-dark-header">
                                        <tr>
                                            <th className="text-white fw-medium py-3 px-3">Statut</th>
                                            <th className="text-white fw-medium">Site / Village</th>
                                            <th className="text-white fw-medium">Dernière visite</th>
                                            <th className="text-white fw-medium">Alertes</th>
                                            <th className="text-white fw-medium">Ancienneté</th>
                                            <th className="text-white fw-medium">Dernière maint.</th>
                                            <th className="text-white fw-medium">Détail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, i) => (
                                            <tr key={item.well_id}
                                                style={{
                                                    backgroundColor:
                                                        item.status === 'unresolved' ? '#FFF8F8' :
                                                        item.status === 'resolved' ? '#FFFEF0' :
                                                        i % 2 === 0 ? '#F9F9F9' : '#fff'
                                                }}>
                                                <td className="px-3">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td>
                                                    <div className="fw-medium" style={{ color: '#1F4E79' }}>
                                                        {item.well_code}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '11px' }}>
                                                        {item.village} {item.region !== 'Inconnu' ? `· ${item.region}` : ''}
                                                    </div>
                                                </td>
                                                <td>
                                                    {new Date(item.last_visit_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td>
                                                    {item.alerts_count > 0 ? (
                                                        <span className="badge rounded-pill"
                                                              style={{ backgroundColor: '#FDECEC', color: '#C0392B' }}>
                                                            {item.alerts_count} alerte{item.alerts_count > 1 ? 's' : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.alerts?.filter(a => !a.resolved).length > 0 && (
                                                        <span className="badge rounded-pill"
                                                              style={{
                                                                  backgroundColor: getDaysColor(getMaxDaysOpen(item.alerts)),
                                                                  color: getDaysColor(getMaxDaysOpen(item.alerts)) === '#F1C40F' ? '#333' : '#fff',
                                                                  fontSize: '11px'
                                                              }}>
                                                            ⏱ {getDaysLabel(getMaxDaysOpen(item.alerts))}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.last_maintenance_date
                                                        ? new Date(item.last_maintenance_date).toLocaleDateString('fr-FR')
                                                        : <span className="text-muted small">Aucune</span>
                                                    }
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => setSelected(
                                                            selected?.well_id === item.well_id ? null : item
                                                        )}
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: '#1F4E79', fontSize: '11px' }}>
                                                        {selected?.well_id === item.well_id ? '✕' : 'Voir →'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="card-footer bg-white small text-muted">
                            {data.length} sites affichés — triés par priorité (non résolus en premier)
                        </div>
                    </div>
                </div>

                {/* Panneau détail */}
                {selected && (
                    <div className="col-md-5">
                        <div className="card border-0 shadow-sm" style={{ position: 'sticky', top: '80px' }}>
                            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-medium" style={{ color: '#1F4E79' }}>
                                        Puits {selected.well_code} — {selected.village}
                                    </span>
                                    <div className="mt-1">
                                        <StatusBadge status={selected.status} />
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)}
                                        className="btn btn-sm btn-outline-secondary">✕</button>
                            </div>
                            <div className="card-body small">

                                {/* Info visite */}
                                <div className="mb-3 p-2 rounded" style={{ backgroundColor: '#F0F5FA' }}>
                                    <div className="fw-medium mb-1" style={{ color: '#1F4E79' }}>
                                        Dernière supervision
                                    </div>
                                    <div className="text-muted">
                                        📅 {new Date(selected.last_visit_date).toLocaleDateString('fr-FR', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                {/* Alertes */}
                                {selected.alerts_count > 0 ? (
                                    <div className="mb-3">
                                        <div className="fw-medium mb-2">
                                            Problèmes signalés ({selected.alerts_count})
                                        </div>
                                        {selected.alerts.map(alert => (
                                            <div key={alert.id}
                                                 className="p-2 mb-2 rounded"
                                                 style={{
                                                     borderLeft: `3px solid ${
                                                         alert.severity === 'CRITICAL' ? '#C0392B' :
                                                         alert.severity === 'HIGH' ? '#E67E22' : '#F1C40F'
                                                     }`,
                                                     backgroundColor: '#FAFAFA'
                                                 }}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <span className="fw-medium">{alert.issue}</span>
                                                    <SeverityBadge severity={alert.severity} />
                                                </div>
                                                <div className="d-flex justify-content-between mt-1" style={{ fontSize: '11px' }}>
                                                    <span className="text-muted">{alert.component}</span>
                                                    {!alert.resolved && alert.days_open !== undefined && (
                                                        <span className="badge rounded-pill"
                                                              style={{
                                                                  backgroundColor: getDaysColor(alert.days_open),
                                                                  color: getDaysColor(alert.days_open) === '#F1C40F' ? '#333' : '#fff',
                                                                  fontSize: '10px'
                                                              }}>
                                                            ⏱ {getDaysLabel(alert.days_open)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mb-3 p-2 rounded text-center"
                                         style={{ backgroundColor: '#E8F8EF', color: '#27AE60' }}>
                                        ✅ Aucun problème signalé lors de la dernière visite
                                    </div>
                                )}

                                {/* Dernière maintenance */}
                                {selected.last_maintenance_date && (
                                    <div className="mb-3 p-2 rounded"
                                         style={{ backgroundColor: '#F8F8F7' }}>
                                        <div className="fw-medium mb-1">Dernière maintenance</div>
                                        <div className="text-muted small">
                                            📅 {new Date(selected.last_maintenance_date).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="mt-1">
                                            {selected.last_maintenance_result === 'fully_working'
                                                ? <span style={{ color: '#27AE60' }}>✅ Résultat : Fonctionnel</span>
                                                : <span style={{ color: '#E67E22' }}>⚠️ Résultat : {selected.last_maintenance_result || '—'}</span>
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Liens */}
                                <div className="d-flex gap-2 mt-3">
                                    {selected.well_id && (
                                        <Link to={`/wells/${selected.well_id}`}
                                              className="btn btn-sm text-white"
                                              style={{ backgroundColor: '#1F4E79', fontSize: '11px' }}>
                                            Fiche du puits →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
