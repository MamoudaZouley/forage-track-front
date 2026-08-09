import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

const COLORS = ['#C0392B', '#27AE60', '#1F4E79', '#E67E22', '#F1C40F', '#8E44AD'];

export default function StatisticsPage() {
    const [dashboard, setDashboard] = useState(null);
    const [wellsStatus, setWellsStatus] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/dashboard'),
            api.get('/alerts/wells-status'),
            api.get('/maintenances?limit=1000'),
        ]).then(([dashRes, alertsRes, maintRes]) => {
            setDashboard(dashRes.data);
            setWellsStatus(alertsRes.data);
            setMaintenances(maintRes.data.data || []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    // Données pour graphiques
    const statusPieData = [
        { name: 'Non résolu', value: wellsStatus?.stats?.unresolved || 0 },
        { name: 'Résolu', value: wellsStatus?.stats?.resolved || 0 },
        { name: 'Pas de problème', value: wellsStatus?.stats?.no_problem || 0 },
    ];
    const statusColors = ['#C0392B', '#F1C40F', '#27AE60'];

    const wellsPieData = [
        { name: 'Opérationnel', value: dashboard?.wells?.operational || 0 },
        { name: 'En panne', value: dashboard?.wells?.not_working || 0 },
        { name: 'Suspendu', value: dashboard?.wells?.suspended || 0 },
    ];
    const wellsColors = ['#27AE60', '#C0392B', '#E67E22'];

    // Maintenances par mois
    const maintByMonth = maintenances.reduce((acc, m) => {
        const month = new Date(m.visit_date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});
    const maintByMonthData = Object.entries(maintByMonth)
        .map(([month, count]) => ({ month, count }))
        .slice(-12);

    // Maintenances par type
    const maintByType = maintenances.reduce((acc, m) => {
        const type = m.maintenance_type || 'Inconnu';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const maintByTypeData = Object.entries(maintByType)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    // Alertes par composant
    const alertsByComponent = (wellsStatus?.data || []).reduce((acc, site) => {
        (site.alerts || []).forEach(alert => {
            acc[alert.component] = (acc[alert.component] || 0) + 1;
        });
        return acc;
    }, {});
    const alertsByComponentData = Object.entries(alertsByComponent)
        .map(([component, count]) => ({ component, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Top 10 sites avec le plus de maintenances
    const maintBySite = maintenances.reduce((acc, m) => {
        const code = m.well_code || 'Inconnu';
        acc[code] = (acc[code] || 0) + 1;
        return acc;
    }, {});
    const top10Sites = Object.entries(maintBySite)
        .map(([site, count]) => ({ site, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                Statistiques & Graphiques
            </h4>

            {/* Ligne 1 — Pie charts */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Statut des alertes par site
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center">
                            <PieChart width={300} height={250}>
                                <Pie data={statusPieData} cx={150} cy={110}
                                     outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {statusPieData.map((_, i) => (
                                        <Cell key={i} fill={statusColors[i]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Statut des puits
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center">
                            <PieChart width={300} height={250}>
                                <Pie data={wellsPieData} cx={150} cy={110}
                                     outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {wellsPieData.map((_, i) => (
                                        <Cell key={i} fill={wellsColors[i]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ligne 2 — Maintenances par mois */}
            <div className="row g-3 mb-4">
                <div className="col-md-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Évolution des maintenances dans le temps
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={maintByMonthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#1F4E79"
                                          strokeWidth={2} name="Maintenances" dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ligne 3 — Alertes par composant + Type maintenance */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Problèmes les plus fréquents (par composant)
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={alertsByComponentData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis dataKey="component" type="category" tick={{ fontSize: 11 }} width={90} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Alertes" fill="#C0392B" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Maintenances par type
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={maintByTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Maintenances" fill="#1F4E79" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ligne 4 — Top 10 sites */}
            <div className="row g-3">
                <div className="col-md-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Top 10 sites avec le plus de maintenances
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={top10Sites}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="site" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Maintenances" fill="#27AE60" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}