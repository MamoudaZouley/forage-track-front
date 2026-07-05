import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

function StatusBadge({ status }) {
    const config = {
        operational: { label: 'Opérationnel', color: '#E8F8EF', text: '#27AE60' },
        not_working: { label: 'En panne', color: '#FDECEC', text: '#E74C3C' },
        suspended: { label: 'Suspendu', color: '#FEF3E7', text: '#E67E22' },
    };
    const c = config[status] || config.operational;
    return (
        <span className="badge rounded-pill px-3 py-2"
              style={{ backgroundColor: c.color, color: c.text, fontSize: '13px' }}>
            {c.label}
        </span>
    );
}

export default function SupervisionDetailPage() {
    const { wellId, supId } = useParams();
    const { user } = useAuth();
    const [supervision, setSupervision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(null);

    useEffect(() => {
        api.get(`/supervisions/${supId}`)
            .then(res => setSupervision(res.data))
            .finally(() => setLoading(false));
    }, [supId]);

    const handleResolve = async (alertId) => {
        setResolving(alertId);
        try {
            await api.patch(`/alerts/${alertId}/resolve`);
            setSupervision(prev => ({
                ...prev,
                alerts: prev.alerts.map(a =>
                    a.id === alertId
                        ? { ...a, resolved: true, resolved_at: new Date().toISOString() }
                        : a
                )
            }));
        } finally {
            setResolving(null);
        }
    };

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;
    if (!supervision) return <Layout><div className="alert alert-danger">Supervision introuvable</div></Layout>;

    return (
        <Layout>
            {/* Breadcrumb */}
            <nav className="mb-3">
                <span className="text-muted small">
                    <Link to="/wells" className="text-decoration-none" style={{ color: '#1F4E79' }}>Puits</Link>
                    {' › '}
                    <Link to={`/wells/${wellId}`} className="text-decoration-none" style={{ color: '#1F4E79' }}>
                        {supervision.well?.code}
                    </Link>
                    {' › '}
                    <span>Supervision du {new Date(supervision.visit_date).toLocaleDateString('fr-FR')}</span>
                </span>
            </nav>

            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                Supervision du {new Date(supervision.visit_date).toLocaleDateString('fr-FR')} — {supervision.well?.code}
            </h4>

            {/* Détails + Statut */}
            <div className="row g-3 mb-4">
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Détails de la visite
                        </div>
                        <div className="card-body">
                            <table className="table table-sm mb-0 small">
                                <tbody>
                                    {[
                                        ['Date de visite', new Date(supervision.visit_date).toLocaleDateString('fr-FR')],
                                        ['Superviseur', supervision.supervisor_name],
                                        ['Nom utilisateur', supervision.supervisor_username],
                                        ['Durée', `${supervision.duration_minutes} minutes`],
                                        ['Semaine', `Semaine ${supervision.week_number}`],
                                        ['Soumission Kobo', supervision.submission_time
                                            ? new Date(supervision.submission_time).toLocaleString('fr-FR')
                                            : '—'],
                                    ].map(([label, value]) => (
                                        <tr key={label}>
                                            <td className="text-muted" style={{ width: '160px' }}>{label}</td>
                                            <td className="fw-medium">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="card border-0 shadow-sm h-100"
                         style={{
                             backgroundColor: supervision.overall_status === 'not_working' ? '#FFF5F5' :
                                              supervision.overall_status === 'suspended' ? '#FFF8F0' : '#F8FFF8'
                         }}>
                        <div className="card-header bg-transparent fw-medium border-bottom"
                             style={{
                                 color: supervision.overall_status === 'not_working' ? '#C0392B' :
                                        supervision.overall_status === 'suspended' ? '#E67E22' : '#27AE60'
                             }}>
                            Statut constaté
                        </div>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center">
                            <StatusBadge status={supervision.overall_status} />
                            <div className="mt-4 text-center">
                                <div className="text-muted small">Alertes détectées</div>
                                <div className="fs-3 fw-bold text-danger">
                                    {supervision.alerts?.length || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertes */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-medium" style={{ color: '#1F4E79' }}>
                        Alertes détectées lors de cette visite
                    </span>
                    <span className="badge rounded-pill"
                          style={{ backgroundColor: '#FDECEC', color: '#C0392B' }}>
                        {supervision.alerts?.length || 0}
                    </span>
                </div>
                <div className="card-body">
                    {supervision.alerts?.length === 0 ? (
                        <div className="text-center text-muted py-3">
                            ✅ Aucune alerte détectée lors de cette visite
                        </div>
                    ) : (
                        supervision.alerts?.map(alert => (
                            <div key={alert.id}
                                 className="p-3 mb-3 rounded"
                                 style={{
                                     backgroundColor: alert.resolved ? '#F9F9F9' :
                                         alert.severity === 'CRITICAL' ? '#FDECEC' :
                                         alert.severity === 'HIGH' ? '#FEF3E7' : '#FFFDE7',
                                     borderLeft: `4px solid ${
                                         alert.resolved ? '#ccc' :
                                         alert.severity === 'CRITICAL' ? '#C0392B' :
                                         alert.severity === 'HIGH' ? '#E67E22' : '#F1C40F'
                                     }`
                                 }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <SeverityBadge severity={alert.severity} />
                                            <span className="fw-medium"
                                                  style={{ color: alert.resolved ? '#888' : '#333' }}>
                                                {alert.issue}
                                            </span>
                                        </div>
                                        <div className="small text-muted">
                                            Composant : {alert.component}
                                        </div>
                                        <div className="small text-muted">
                                            Priorité : intervention sous {alert.priority_hours}h
                                        </div>
                                        {alert.resolved && (
                                            <div className="small mt-1" style={{ color: '#27AE60' }}>
                                                ✓ Résolu le {new Date(alert.resolved_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {!alert.resolved && user?.role === 'admin' && (
                                            <button
                                                onClick={() => handleResolve(alert.id)}
                                                disabled={resolving === alert.id}
                                                className="btn btn-sm text-white"
                                                style={{ backgroundColor: '#27AE60', fontSize: '11px' }}>
                                                {resolving === alert.id ? '...' : '✓ Résoudre'}
                                            </button>
                                        )}
                                        {alert.resolved && (
                                            <span className="badge"
                                                  style={{ backgroundColor: '#E8F8EF', color: '#27AE60' }}>
                                                Résolu
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-3">
                <Link to={`/wells/${wellId}`}
                      className="small text-decoration-none"
                      style={{ color: '#1F4E79' }}>
                    ← Retour à la fiche puits
                </Link>
            </div>
        </Layout>
    );
}