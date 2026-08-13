import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

const COLORS = ['#1F4E79', '#27AE60', '#C0392B', '#E67E22', '#F1C40F', '#8E44AD', '#16A085', '#2C3E50'];

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

const renderPieLabel = ({ name, value, percent }) =>
    percent > 0.03 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : '';

const typeLabels = {
    emergency: 'Urgence',
    preventive: 'Préventive',
    corrective: 'Corrective',
    repair: 'Réparation',
};

const resultLabels = {
    fully_working: 'Fonctionnel',
    partially_working: 'Partiel',
    not_working: 'En panne',
    needs_parts: 'Pièces requises',
};

const componentLabels = {
    pump_replacement: 'Remplacement pompe',
    controller_replacement: 'Remplacement contrôleur',
    panel_replacement: 'Remplacement panneau',
    pipe_repair: 'Réparation tuyaux',
    tank_repair: 'Réparation cuve',
    tap_repair: 'Réparation robinets',
    electrical_repair: 'Réparation électrique',
    other: 'Autre',
};

export default function StatisticsPage() {
    const [dashboard, setDashboard] = useState(null);
    const [wellsStatus, setWellsStatus] = useState(null);
    const [maintStats, setMaintStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/dashboard'),
            api.get('/alerts/wells-status'),
            api.get('/maintenances/stats'),
        ]).then(([dashRes, alertsRes, maintRes]) => {
            setDashboard(dashRes.data);
            setWellsStatus(alertsRes.data);
            setMaintStats(maintRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    // Statut alertes
    const statusPieData = [
        { name: 'Non résolu', value: wellsStatus?.stats?.unresolved || 0 },
        { name: 'Résolu', value: wellsStatus?.stats?.resolved || 0 },
        { name: 'Sans problème', value: wellsStatus?.stats?.no_problem || 0 },
    ].filter(d => d.value > 0);

    // Statut puits
    const wellsPieData = [
        { name: 'Opérationnel', value: dashboard?.wells?.operational || 0 },
        { name: 'En panne', value: dashboard?.wells?.not_working || 0 },
    ].filter(d => d.value > 0);

    // Maintenances par mois
    const maintByMonthData = Object.entries(maintStats?.by_month || {})
        .map(([month, count]) => ({
            month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            count
        }));

    // Maintenances par type
    const maintByTypeData = Object.entries(maintStats?.by_type || {})
        .map(([type, count]) => ({
            type: typeLabels[type] || type || 'Autre',
            count
        }))
        .sort((a, b) => b.count - a.count);

    // Résultats maintenances
    const maintByResultData = Object.entries(maintStats?.by_result || {})
        .map(([result, count]) => ({
            result: resultLabels[result] || result || 'Autre',
            count
        }))
        .sort((a, b) => b.count - a.count);

    // Top 5 sites
    const top5Sites = Object.entries(maintStats?.top_sites || {})
        .map(([site, count]) => ({
            site: site.length > 15 ? site.substring(0, 15) + '.' : site,
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Composants utilisés
    const byComponentData = Object.entries(maintStats?.by_component || {})
        .map(([component, count]) => ({
            component: componentLabels[component] || component || 'Autre',
            count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Alertes par composant
    const alertsByComponent = (wellsStatus?.data || []).reduce((acc, site) => {
        (site.alerts || []).forEach(alert => {
            acc[alert.component] = (acc[alert.component] || 0) + 1;
        });
        return acc;
    }, {});
    const alertsByComponentData = Object.entries(alertsByComponent)
        .map(([component, count]) => ({ component, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                Statistiques & Graphiques
            </h4>

            {/* Cartes résumé */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Total puits', value: dashboard?.wells?.total, color: '#1F4E79' },
                    { label: 'En panne', value: dashboard?.wells?.not_working, color: '#C0392B' },
                    { label: 'Alertes Critical', value: dashboard?.alerts?.critical, color: '#E74C3C' },
                    { label: 'Total maintenances', value: maintStats?.total, color: '#27AE60' },
                    { label: 'Urgences', value: maintStats?.by_type?.emergency || 0, color: '#E67E22' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="col">
                        <div className="card border-0 shadow-sm text-center h-100">
                            <div className="card-body py-3">
                                <div className="fs-3 fw-bold" style={{ color }}>{value ?? '—'}</div>
                                <div className="text-muted small">{label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ligne 1 — Pie charts */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Statut des alertes par site ({wellsStatus?.stats?.total} sites)
                        </div>
                        <div className="card-body d-flex justify-content-center align-items-center">
                            <PieChart width={420} height={300}>
                                <Pie data={statusPieData} cx={210} cy={130}
                                    outerRadius={100} dataKey="value"
                                    label={({ name, value, percent }) => 
                                        percent > 0.03 ? `${value} (${(percent * 100).toFixed(0)}%)` : ''
                                    }
                                    labelLine={true}>
                                    {statusPieData.map((_, i) => (
                                        <Cell key={i} fill={['#C0392B', '#F1C40F', '#27AE60'][i]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Statut des puits ({dashboard?.wells?.total} puits)
                        </div>
                        <div className="card-body d-flex justify-content-center align-items-center">
                            <PieChart width={420} height={300}>
                                <Pie data={wellsPieData} cx={210} cy={130}
                                    outerRadius={100} dataKey="value"
                                    label={({ name, value, percent }) => 
                                        percent > 0.03 ? `${value} (${(percent * 100).toFixed(0)}%)` : ''
                                    }
                                    labelLine={true}>
                                    {wellsPieData.map((_, i) => (
                                        <Cell key={i} fill={['#27AE60', '#C0392B'][i]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ligne 2 — Évolution maintenances */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-medium border-bottom"
                     style={{ color: '#1F4E79' }}>
                    Évolution des maintenances dans le temps ({maintStats?.total} interventions)
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={maintByMonthData}
                                   margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }}
                                   angle={-30} textAnchor="end" height={50} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" />
                            <Line type="monotone" dataKey="count" stroke="#1F4E79"
                                  strokeWidth={2} name="Maintenances"
                                  dot={{ r: 5, fill: '#1F4E79' }}
                                  activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ligne 3 — Type + Résultats */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Maintenances par type
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={maintByTypeData}
                                          margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="type" tick={{ fontSize: 12 }}
                                           angle={-15} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Maintenances"
                                         fill="#1F4E79" radius={[4, 4, 0, 0]}>
                                        {maintByTypeData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Résultats des maintenances
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={maintByResultData} layout="vertical"
                                          margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis dataKey="result" type="category"
                                           tick={{ fontSize: 12 }} width={110} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Maintenances"
                                         radius={[0, 4, 4, 0]}>
                                        {maintByResultData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ligne 4 — Alertes par composant */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-medium border-bottom"
                     style={{ color: '#1F4E79' }}>
                    Problèmes les plus fréquents (alertes actives)
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={alertsByComponentData} layout="vertical"
                                  margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="component" type="category"
                                   tick={{ fontSize: 12 }} width={110} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Alertes"
                                 fill="#C0392B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ligne 5 — Top 5 sites + Composants */}
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Top 5 sites avec le plus de maintenances
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={top5Sites}
                                          margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="site" tick={{ fontSize: 11 }}
                                           angle={-30} textAnchor="end" height={70} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Maintenances"
                                         fill="#27AE60" radius={[4, 4, 0, 0]}>
                                        {top5Sites.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Composants utilisés lors des maintenances
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={byComponentData} layout="vertical"
                                          margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis dataKey="component" type="category"
                                           tick={{ fontSize: 11 }} width={140} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Maintenances"
                                         radius={[0, 4, 4, 0]}>
                                        {byComponentData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}