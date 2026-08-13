import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, ResponsiveContainer, Cell, Legend
} from 'recharts';

const COLORS = ['#1F4E79', '#27AE60', '#C0392B', '#E67E22', '#F1C40F', '#8E44AD'];

const resultLabels = {
    fully_working: 'Fonctionnel',
    partially_working: 'Partiel',
    not_repairable: 'Non réparable',
    needs_parts: 'Pièces requises',
    needs_specialist: 'Spécialiste requis',
    '': 'Non renseigné',
};

const typeLabels = {
    emergency: 'Urgence',
    replacement: 'Remplacement',
    repair: 'Réparation',
    scheduled: 'Planifié',
    inspection: 'Inspection',
};

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

export default function TechnicianStatsPage() {
    const [stats, setStats] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/maintenances/technician-stats')
            .then(res => {
                setStats(res.data);
                if (res.data.length > 0) setSelected(res.data[0]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    // Données comparatives pour tous les techniciens
    const compData = stats.map(t => ({ name: t.name.split(' ')[0], total: t.total, sites: t.sites }));

    const selectedByResult = selected ? Object.entries(selected.by_result)
        .map(([k, v]) => ({ result: resultLabels[k] || k, count: v }))
        .sort((a, b) => b.count - a.count) : [];

    const selectedByType = selected ? Object.entries(selected.by_type)
        .map(([k, v]) => ({ type: typeLabels[k] || k, count: v }))
        .sort((a, b) => b.count - a.count) : [];

    const selectedByMonth = selected ? Object.entries(selected.by_month)
        .map(([month, count]) => ({
            month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
            count
        })) : [];

    const selectedComponents = selected ? [
    ...(selected.components.pump > 0 ? [{ name: 'Pompe', value: selected.components.pump }] : []),
    ...(selected.components.solar_panel > 0 ? [{ name: 'Panneau solaire', value: selected.components.solar_panel }] : []),
    ...(selected.components.controller > 0 ? [{ name: 'Contrôleur', value: selected.components.controller }] : []),
    ...(selected.components.taps > 0 ? [{ name: 'Robinets', value: selected.components.taps }] : []),
    ...(selected.other_details && Object.keys(selected.other_details).length > 0
        ? Object.entries(selected.other_details).map(([k, v]) => ({ name: k, value: v }))
        : selected.components.other > 0 ? [{ name: 'Autre', value: selected.components.other }] : []
    ),
   ].filter(c => c.value > 0) : [];

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                KPI Techniciens de maintenance
            </h4>

            {/* Cartes résumé par technicien */}
            <div className="row g-3 mb-4">
                {stats.map((tech, i) => (
                    <div key={tech.name} className="col-md-3">
                        <div className="card border-0 shadow-sm h-100"
                             style={{
                                 cursor: 'pointer',
                                 borderLeft: `4px solid ${COLORS[i]}`,
                                 backgroundColor: selected?.name === tech.name ? '#F0F5FA' : '#fff'
                             }}
                             onClick={() => setSelected(tech)}>
                            <div className="card-body">
                                <div className="fw-bold mb-2" style={{ color: COLORS[i] }}>
                                    {tech.name}
                                </div>
                                <div className="row g-2 text-center">
                                    <div className="col-6">
                                        <div className="fs-4 fw-bold" style={{ color: COLORS[i] }}>
                                            {tech.total}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '11px' }}>Interventions</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="fs-4 fw-bold" style={{ color: COLORS[i] }}>
                                            {tech.sites}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '11px' }}>Sites</div>
                                    </div>
                                </div>
                                <div className="mt-2 small text-center">
                                    <span className="badge rounded-pill"
                                          style={{ backgroundColor: '#E8F8EF', color: '#27AE60' }}>
                                        ✅ {tech.by_result?.fully_working || 0} réussis
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparaison globale */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-medium border-bottom"
                     style={{ color: '#1F4E79' }}>
                    Comparaison des interventions par technicien
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={compData} margin={{ top: 5, right: 40, left: 90, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="total" name="Interventions" radius={[4, 4, 0, 0]}>
                                {compData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Bar>
                            <Bar dataKey="sites" name="Sites" radius={[4, 4, 0, 0]} fill="#E0E0E0" />
                        </BarChart>
                      
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Détail technicien sélectionné */}
            {selected && (
                <>
                    <h5 className="fw-bold mb-3" style={{ color: '#1F4E79' }}>
                        Détail — {selected.name}
                        <span className="badge ms-2 rounded-pill"
                              style={{ backgroundColor: '#EAF3FB', color: '#1F4E79', fontSize: '13px' }}>
                            {selected.total} interventions
                        </span>
                    </h5>

                    <div className="row g-3 mb-4">
                        {/* Évolution par mois */}
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-medium border-bottom"
                                     style={{ color: '#1F4E79' }}>
                                    Évolution des interventions par mois
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
                                                  name="Interventions"
                                                  dot={{ r: 5, fill: '#1F4E79' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Résultats */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-medium border-bottom"
                                     style={{ color: '#1F4E79' }}>
                                    Résultats
                                </div>
                                <div className="card-body">
                                    {selectedByResult.map((r, i) => (
                                        <div key={r.result} className="mb-2">
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span>{r.result}</span>
                                                <span className="fw-medium">{r.count}</span>
                                            </div>
                                            <div className="progress" style={{ height: '6px' }}>
                                                <div className="progress-bar"
                                                     style={{
                                                         width: `${(r.count / selected.total * 100).toFixed(0)}%`,
                                                         backgroundColor: COLORS[i % COLORS.length]
                                                     }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3">
                        {/* Types d'intervention */}
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-medium border-bottom"
                                     style={{ color: '#1F4E79' }}>
                                    Types d'intervention
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={200}>
                                      <BarChart data={selectedByType} layout="vertical"
                                                margin={{ top: 5, right: 40, left: 90, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tick={{ fontSize: 12 }} />
                                            <YAxis dataKey="type" type="category"
                                                tick={{ fontSize: 12 }} width={90} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" name="Interventions"
                                                radius={[0, 4, 4, 0]}
                                                label={{ position: 'right', fontSize: 12, fill: '#333' }}>
                                                {selectedByType.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Composants remplacés */}
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white fw-medium border-bottom"
                                     style={{ color: '#1F4E79' }}>
                                    Composants remplacés
                                </div>
                                <div className="card-body">
                                    {selectedComponents.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={selectedComponents} layout="vertical"
                                                      margin={{ top: 5, right: 20, left: 110, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                                <YAxis dataKey="name" type="category"
                                                       tick={{ fontSize: 12 }} width={110} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" name="Quantité"
                                                     fill="#27AE60" radius={[0, 4, 4, 0]}>
                                                    {selectedComponents.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-muted py-4">
                                            Aucun composant enregistré
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
}