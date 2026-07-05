import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
              style={{ backgroundColor: c.bg, color: c.color, fontSize: '11px' }}>
            {severity}
        </span>
    );
}

export default function AlertsListPage() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ severity: '', resolved: 'false', region: '' });
    const [page, setPage] = useState(1);
    const [resolving, setResolving] = useState(null);

    const fetchAlerts = (p = 1, f = filters) => {
        setLoading(true);
        api.get('/alerts', { params: { page: p, ...f } })
            .then(res => {
                setAlerts(res.data.data);
                setMeta(res.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAlerts(); }, []);

    const handleFilter = (e) => {
        e.preventDefault();
        setPage(1);
        fetchAlerts(1, filters);
    };

    const handleReset = () => {
        const reset = { severity: '', resolved: 'false', region: '' };
        setFilters(reset);
        setPage(1);
        fetchAlerts(1, reset);
    };

    const handleResolve = async (alertId) => {
        setResolving(alertId);
        try {
            await api.patch(`/alerts/${alertId}/resolve`);
            setAlerts(prev => prev.map(a =>
                a.id === alertId
                    ? { ...a, resolved: true, resolved_at: new Date().toISOString() }
                    : a
            ));
        } finally {
            setResolving(null);
        }
    };

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                Alertes
                {meta && (
                    <span className="badge ms-2 rounded-pill"
                          style={{ backgroundColor: '#FDECEC', color: '#C0392B', fontSize: '13px' }}>
                        {meta.total} non résolues
                    </span>
                )}
            </h4>

            {/* Filtres */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <form className="row g-2 align-items-end" onSubmit={handleFilter}>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Sévérité</label>
                            <select className="form-select form-select-sm"
                                    value={filters.severity}
                                    onChange={e => setFilters({ ...filters, severity: e.target.value })}>
                                <option value="">Toutes</option>
                                <option value="CRITICAL">CRITICAL</option>
                                <option value="HIGH">HIGH</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="LOW">LOW</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Statut</label>
                            <select className="form-select form-select-sm"
                                    value={filters.resolved}
                                    onChange={e => setFilters({ ...filters, resolved: e.target.value })}>
                                <option value="false">Non résolues</option>
                                <option value="true">Résolues</option>
                                <option value="">Toutes</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Région</label>
                            <select className="form-select form-select-sm"
                                    value={filters.region}
                                    onChange={e => setFilters({ ...filters, region: e.target.value })}>
                                <option value="">Toutes</option>
                                <option value="Maradi">Maradi</option>
                                <option value="Zinder">Zinder</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button type="submit" className="btn btn-sm text-white w-100"
                                    style={{ backgroundColor: '#1F4E79' }}>
                                Filtrer
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={handleReset}>
                                ✕
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Liste alertes */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-4">Chargement...</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center p-4 text-muted">
                            ✅ Aucune alerte trouvée
                        </div>
                    ) : (
                        <table className="table table-hover mb-0 small">
                            <thead style={{ backgroundColor: '#1F4E79' }}>
                                <tr>
                                    <th className="text-white fw-medium py-3 px-3">Sévérité</th>
                                    <th className="text-white fw-medium">Village / Puits</th>
                                    <th className="text-white fw-medium">Composant</th>
                                    <th className="text-white fw-medium">Problème</th>
                                    <th className="text-white fw-medium">Date</th>
                                    <th className="text-white fw-medium">Statut</th>
                                    {user?.role === 'admin' && (
                                        <th className="text-white fw-medium">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert, i) => (
                                    <tr key={alert.id}
                                        style={{
                                            backgroundColor: alert.resolved ? '#F9F9F9' :
                                                alert.severity === 'CRITICAL' ? '#FFF5F5' :
                                                alert.severity === 'HIGH' ? '#FFFAF5' : '#fff'
                                        }}>
                                        <td className="px-3">
                                            <SeverityBadge severity={alert.severity} />
                                        </td>
                                        <td>
                                            <Link to={`/wells/${alert.well_id}`}
                                                  className="text-decoration-none fw-medium"
                                                  style={{ color: '#1F4E79' }}>
                                                {alert.well?.code}
                                            </Link>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>
                                                {alert.village}
                                            </div>
                                        </td>
                                        <td>{alert.component}</td>
                                        <td>{alert.issue}</td>
                                        <td>
                                            {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td>
                                            {alert.resolved ? (
                                                <span className="badge rounded-pill"
                                                      style={{ backgroundColor: '#E8F8EF', color: '#27AE60' }}>
                                                    ✓ Résolu
                                                </span>
                                            ) : (
                                                <span className="badge rounded-pill"
                                                      style={{ backgroundColor: '#FDECEC', color: '#C0392B' }}>
                                                    Non résolu
                                                </span>
                                            )}
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td>
                                                {!alert.resolved && (
                                                    <button
                                                        onClick={() => handleResolve(alert.id)}
                                                        disabled={resolving === alert.id}
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: '#27AE60', fontSize: '11px' }}>
                                                        {resolving === alert.id ? '...' : '✓ Résoudre'}
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center small">
                        <span className="text-muted">
                            {meta.from}–{meta.to} sur {meta.total} alertes
                        </span>
                        <div className="d-flex gap-1">
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                                <button key={p}
                                        onClick={() => { setPage(p); fetchAlerts(p); }}
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
        </Layout>
    );
}