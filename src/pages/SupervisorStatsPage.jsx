import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import SupervisorZoneFilter from '../components/SupervisorZoneFilter';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, ResponsiveContainer, Cell, Legend, RadarChart,
    Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

const COLORS = ['#1F4E79', '#27AE60', '#C0392B', '#E67E22', '#F1C40F', '#8E44AD', '#16A085', '#2C3E50', '#E91E63', '#00BCD4'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 rounded shadow small"
                 style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
                <p className="fw-medium mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, margin: 0 }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function SupervisorStatsPage() {
    const [stats, setStats] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('total_visits');

    useEffect(() => {
        api.get('/supervisions/supervisor-stats')
            .then(res => {
                setStats(res.data);
                if (res.data.length > 0) setSelected(res.data[0]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    const sorted = [...stats].sort((a, b) => b[sortBy] - a[sortBy]);

    // Données comparatives top 10
    const compData = sorted.slice(0, 10).map(s => ({
        name: s.username,
        visites: s.total_visits,
        alertes: s.total_alerts,
        taux: s.detection_rate,
    }));

    const selectedByMonth = selected ? Object.entries(selected.by_month)
        .map(([month, count]) => ({
            month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            count
        })) : [];

    const selectedByStatus = selected ? Object.entries(selected.by_status)
        .map(([status, count]) => ({
            status: status === 'operational' ? 'Opérationnel' :
                    status === 'not_working' ? 'En panne' : 'Suspendu',
            count
        })) : [];

    const selectedAlertsByComponent = selected ? Object.entries(selected.alerts_by_component)
        .map(([component, count]) => ({ component, count }))
        .sort((a, b) => b.count - a.count) : [];

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                KPI Superviseurs
            </h4>

            {/* Filtres de tri */}
            <div className="d-flex gap-2 mb-4">
                <span className="text-muted small align-self-center">Trier par :</span>
                {[
                    { key: 'total_visits', label: 'Visites' },
                    { key: 'total_alerts', label: 'Alertes' },
                    { key: 'detection_rate', label: 'Taux détection' },
                    { key: 'wells_visited', label: 'Sites' },
                ].map(({ key, label }) => (
                    <button key={key}
                            onClick={() => setSortBy(key)}
                            className="btn btn-sm"
                            style={{
                                backgroundColor: sortBy === key ? '#1F4E79' : '#F5F5F5',
                                color: sortBy === key ? '#fff' : '#333',
                            }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Graphique comparatif */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-medium border-bottom"
                     style={{ color: '#1F4E79' }}>
                    Comparaison des superviseurs — Top 10 (cliquer pour voir le détail)
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={compData}
                                  margin={{ top: 5, right: 20, left: 10, bottom: 40 }}
                                  onClick={(data) => {
                                      if (data?.activePayload) {
                                          const username = data.activeLabel;
                                          const found = stats.find(s => s.username === username);
                                          if (found) setSelected(found);
                                      }
                                  }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }}
                                   angle={-30} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="visites" name="Visites" radius={[4, 4, 0, 0]}>
                                {compData.map((entry, i) => (
                                    <Cell key={i}
                                          fill={selected?.username === entry.name ? '#C0392B' : '#1F4E79'}
                                          style={{ cursor: 'pointer' }} />
                                ))}
                            </Bar>
                            <Bar dataKey="alertes" name="Alertes" fill="#E67E22"
                                 radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tableau récapitulatif */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-medium border-bottom"
                     style={{ color: '#1F4E79' }}>
                    Tableau récapitulatif — {stats.length} superviseurs
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 small">
                        <thead className="table-dark-header">
                            <tr>
                                <th className="text-white fw-medium py-3 px-3">Superviseur</th>
                                <th className="text-white fw-medium">Zone</th>
                                <th className="text-white fw-medium text-center">Visites</th>
                                <th className="text-white fw-medium text-center">Sites</th>
                                <th className="text-white fw-medium text-center">Alertes</th>
                                <th className="text-white fw-medium text-center">Taux détection</th>
                                <th className="text-white fw-medium text-center">Détail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((sup, i) => (
                                <tr key={sup.username}
                                    style={{
                                        backgroundColor: selected?.username === sup.username ? '#EAF3FB' :
                                                         i % 2 === 0 ? '#F9F9F9' : '#fff',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelected(sup)}>
                                    <td className="px-3 fw-medium" style={{ color: '#1F4E79' }}>
                                        {sup.username}
                                        <div className="text-muted" style={{ fontSize: '11px' }}>
                                            {sup.region}
                                        </div>
                                    </td>
                                    <td>{sup.zone}</td>
                                    <td className="text-center">{sup.total_visits}</td>
                                    <td className="text-center">{sup.wells_visited}</td>
                                    <td className="text-center">{sup.total_alerts}</td>
                                    <td className="text-center">
                                        <span className="badge rounded-pill"
                                              style={{
                                                  backgroundColor: sup.detection_rate >= 80 ? '#E8F8EF' :
                                                                   sup.detection_rate >= 50 ? '#FEF3E7' : '#FDECEC',
                                                  color: sup.detection_rate >= 80 ? '#27AE60' :
                                                         sup.detection_rate >= 50 ? '#E67E22' : '#C0392B'
                                              }}>
                                            {sup.detection_rate}%
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => setSelected(sup)}
                                                className="btn btn-sm text-white"
                                                style={{ backgroundColor: '#1F4E79', fontSize: '11px' }}>
                                            Voir →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Détail superviseur sélectionné */}
            {selected && (
                <>
                    <h5 className="fw-bold mb-3" style={{ color: '#1F4E79' }}>
                        Détail — {selected.username}
                        <span className="badge ms-2 rounded-pill"
                              style={{ backgroundColor: '#EAF3FB', color: '#1F4E79', fontSize: '13px' }}>
                            Zone : {selected.zone}
                        </span>
                    </h5>

                    {/* KPI cards */}
                    <div className="row g-3 mb-4">
                        {[
                            { label: 'Total visites', value: selected.total_visits, color: '#1F4E79' },
                            { label: 'Sites visités', value: selected.wells_visited, color: '#27AE60' },
                            { label: 'Alertes détectées', value: selected.total_alerts, color: '#C0392B' },
                            { label: 'Taux de détection', value: `${selected.detection_rate}%`, color: selected.detection_rate >= 80 ? '#27AE60' : '#E67E22' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="col-md-3">
                                <div className="card border-0 shadow-sm text-center">
                                    <div className="card-body py-3">
                                        <div className="fs-3 fw-bold" style={{ color }}>{value}</div>
                                        <div className="text-muted small">{label}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-3">
                        {/* Évolution par mois */}
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-medium border-bottom"
                                     style={{ color: '#1F4E79' }}>
                                    Visites par mois
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={selectedByMonth}
                                                   margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="count"
                                                  stroke="#1F4E79" strokeWidth={2}
                                                  name="Visites"
                                                  dot={{ r: 5, fill: '#1F4E79' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Alertes par composant */}
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-medium border-bottom"
                                     style={{ color: '#1F4E79' }}>
                                    Alertes détectées par composant
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={selectedAlertsByComponent} layout="vertical"
                                                  margin={{ top: 5, right: 40, left: 100, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tick={{ fontSize: 12 }} />
                                            <YAxis dataKey="component" type="category"
                                                   tick={{ fontSize: 12 }} width={100} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" name="Alertes"
                                                 radius={[0, 4, 4, 0]}
                                                 label={{ position: 'right', fontSize: 12, fill: '#333' }}>
                                                {selectedAlertsByComponent.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
}