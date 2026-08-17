import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';


export default function DashboardPage() { 
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);

    const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    
    try {
        // Lance la sync sans attendre la réponse
        fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        }).catch(() => {}); // Ignore le timeout

        // Poll le statut toutes les 5 secondes
        let attempts = 0;
        const poll = setInterval(async () => {
            attempts++;
            try {
                const status = await api.get('/sync/status');
                // Rafraîchit le dashboard
                await fetchDashboard();
            } catch {}
            
            if (attempts >= 24) { // 2 minutes max
                clearInterval(poll);
                setSyncing(false);
            }
        }, 5000);

    } catch (err) {
        setSyncError('Erreur de synchronisation');
        setSyncing(false);
    }
    };
  
    useEffect(() => {
        api.get('/dashboard')
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    return (
        <Layout>
            {/* Bouton sync */}
<div className="d-flex justify-content-between align-items-center mb-4">
    <h4 className="fw-bold mb-0" style={{ color: '#1F4E79' }}>Tableau de bord</h4>
    <button
        onClick={handleSync}
        disabled={syncing}
        className="btn btn-sm text-white"
        style={{ backgroundColor: '#27AE60' }}>
        {syncing ? '⏳ Synchronisation...' : '🔄 Synchroniser KoboToolbox'}
    </button>
</div>

{/* Résultat sync */}
{syncResult && (
    <div className={`alert py-2 small mb-3 ${syncResult.success ? 'alert-success' : 'alert-danger'}`}>
        {syncResult.success
            ? `✅ Supervisions: ${syncResult.results?.supervisions?.imported} importées, ${syncResult.results?.supervisions?.skipped} ignorées — Maintenances: ${syncResult.results?.maintenances?.imported} importées`
            : `❌ ${syncResult.message}`
        }
    </div>
)}
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>Tableau de bord</h4>

            {/* Cartes stats */}
            {/* Cartes stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="text-muted small mb-1">Puits opérationnels</div>
                            <div className="fs-2 fw-bold" style={{ color: '#27AE60' }}>
                                {data.wells.operational}
                            </div>
                            <div className="small text-muted">sur {data.wells.total} puits</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: '4px solid #E74C3C' }}>
                        <div className="card-body">
                            <div className="text-muted small mb-1">Puits en panne</div>
                            <div className="fs-2 fw-bold text-danger">
                                {data.wells.not_working}
                            </div>
                            <div className="small text-muted">à traiter</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: '4px solid #C0392B' }}>
                        <div className="card-body">
                            <div className="text-muted small mb-1">Alertes CRITICAL</div>
                            <div className="fs-2 fw-bold text-danger">
                                {data.alerts.critical}
                            </div>
                            <div className="small text-muted">non résolues</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: '4px solid #E67E22' }}>
                        <div className="card-body">
                            <div className="text-muted small mb-1">Alertes MEDIUM</div>
                            <div className="fs-2 fw-bold" style={{ color: '#E67E22' }}>
                                {data.alerts.medium}
                            </div>
                            <div className="small text-muted">non résolues</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card border-0 shadow-sm h-100"
                        style={{ borderLeft: '4px solid #27AE60' }}>
                        <div className="card-body">
                            <div className="text-muted small mb-1">Alertes LOW</div>
                            <div className="fs-2 fw-bold" style={{ color: '#27AE60' }}>
                                {data.alerts.low}
                            </div>
                            <div className="small text-muted">non résolues</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-12 col-lg-1">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="text-muted small mb-1">Maintenances</div>
                            <div className="fs-2 fw-bold" style={{ color: '#1F4E79' }}>
                                {data.maintenances?.total}
                            </div>
                            <div className="small text-muted">
                                {data.maintenances?.emergency} urgences
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deux colonnes */}
            <div className="row g-3">

                {/* Dernières supervisions */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom fw-medium"
                             style={{ color: '#1F4E79' }}>
                            5 dernières supervisions
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0 small">
                                <thead className="table-light">
                                    <tr>
                                        <th>Puits</th>
                                        <th>Superviseur</th>
                                        <th>Date</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recent_supervisions.map(sup => (
                                        <tr key={sup.id}>
                                            <td>
                                                <Link to={`/wells/${sup.well_id}`}
                                                      className="text-decoration-none fw-medium"
                                                      style={{ color: '#1F4E79' }}>
                                                    {sup.well?.code}
                                                </Link>
                                                <div className="text-muted" style={{ fontSize: '11px' }}>
                                                    {sup.well?.village}
                                                </div>
                                            </td>
                                            <td>{sup.supervisor_name}</td>
                                            <td>{new Date(sup.visit_date).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                <StatusBadge status={sup.overall_status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="card-footer bg-white text-center">
                            <Link to="/wells" className="small text-decoration-none"
                                  style={{ color: '#1F4E79' }}>
                                Voir tous les puits →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Alertes critiques */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom fw-medium text-danger">
                            Alertes CRITICAL récentes
                        </div>
                        <div className="card-body p-2">
                            {data.critical_alerts.map(alert => (
                                <div key={alert.id}
                                     className="p-2 mb-2 rounded"
                                     style={{ backgroundColor: '#FDECEC', border: '1px solid #F5A5A5' }}>
                                    <div className="fw-medium small text-danger">{alert.issue}</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>
                                        {alert.village} · {alert.component}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#C0392B' }}>
                                        ⚠ Non résolu · {alert.priority_hours}h
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card-footer bg-white text-center">
                            <Link to="/alerts" className="small text-decoration-none text-danger">
                                Voir toutes les alertes →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function StatusBadge({ status }) {
    const config = {
        operational: { label: 'Opérationnel', color: '#E8F8EF', text: '#27AE60' },
        not_working: { label: 'En panne', color: '#FDECEC', text: '#E74C3C' },
        suspended: { label: 'Suspendu', color: '#FEF3E7', text: '#E67E22' },
    };
    const c = config[status] || config.operational;
    return (
        <span className="badge rounded-pill"
              style={{ backgroundColor: c.color, color: c.text, fontSize: '10px' }}>
            {c.label}
        </span>
    );
}