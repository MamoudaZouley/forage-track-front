import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

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

export default function WellDetailPage() {
    const { id } = useParams();
    const [well, setWell] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/wells/${id}`)
            .then(res => setWell(res.data))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;
    if (!well) return <Layout><div className="alert alert-danger">Puits introuvable</div></Layout>;

    return (
        <Layout>
            {/* Breadcrumb */}
            <nav className="mb-3">
                <span className="text-muted small">
                    <Link to="/wells" className="text-decoration-none" style={{ color: '#1F4E79' }}>
                        Puits
                    </Link>
                    {' › '}
                    <span>{well.code} — {well.village}</span>
                </span>
            </nav>

            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                Puits {well.code} — {well.village}
            </h4>

            {/* Info + Statut */}
            <div className="row g-3 mb-4">
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Informations du puits
                        </div>
                        <div className="card-body">
                            <table className="table table-sm mb-0 small">
                                <tbody>
                                    {[
                                        ['Code', well.code],
                                        ['Village', well.village],
                                        ['Région', well.region],
                                        ['Département', well.department],
                                        ['Commune', well.commune],
                                    ].map(([label, value]) => (
                                        <tr key={label}>
                                            <td className="text-muted" style={{ width: '140px' }}>{label}</td>
                                            <td className="fw-medium">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Statut actuel
                        </div>
                        <div className="card-body d-flex flex-column align-items-center justify-content-center">
                            <StatusBadge status={well.status} />
                            <div className="mt-4 text-center">
                                <div className="text-muted small">Total supervisions</div>
                                <div className="fs-3 fw-bold" style={{ color: '#1F4E79' }}>
                                    {well.supervisions?.length || 0}
                                </div>
                            </div>
                            {well.supervisions?.length > 0 && (
                                <div className="mt-2 text-center">
                                    <div className="text-muted small">Dernière visite</div>
                                    <div className="fw-medium">
                                        {new Date(well.supervisions[0].visit_date)
                                            .toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Historique supervisions */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-medium border-bottom"
                     style={{ color: '#1F4E79' }}>
                    Historique des supervisions
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 small">
                        <thead className="table-dark-header">
                            <tr>
                                <th className="px-3 py-2" style={{ color: '#1F4E79' }}>Date</th>
                                <th style={{ color: '#1F4E79' }}>Superviseur</th>
                                <th style={{ color: '#1F4E79' }}>Statut constaté</th>
                                <th style={{ color: '#1F4E79' }}>Durée (min)</th>
                                <th style={{ color: '#1F4E79' }}>Alertes</th>
                                <th style={{ color: '#1F4E79' }}>Détail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {well.supervisions?.map((sup, i) => (
                                <tr key={sup.id}
                                    style={{ backgroundColor: i % 2 === 0 ? '#F9F9F9' : '#fff' }}>
                                    <td className="px-3">
                                        {new Date(sup.visit_date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td>{sup.supervisor_name}</td>
                                    <td><StatusBadge status={sup.overall_status} /></td>
                                    <td>{sup.duration_minutes}</td>
                                    <td>
                                        <span className="badge rounded-pill"
                                              style={{
                                                  backgroundColor: sup.alerts_count > 0 ? '#FDECEC' : '#E8F8EF',
                                                  color: sup.alerts_count > 0 ? '#E74C3C' : '#27AE60'
                                              }}>
                                            {sup.alerts_count}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/wells/${well.id}/supervisions/${sup.id}`}
                                              className="btn btn-sm text-white"
                                              style={{ backgroundColor: '#1F4E79', fontSize: '11px' }}>
                                            Voir →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-3">
                <Link to="/wells" className="small text-decoration-none"
                      style={{ color: '#1F4E79' }}>
                    ← Retour à la liste des puits
                </Link>
            </div>
        </Layout>
    );
}