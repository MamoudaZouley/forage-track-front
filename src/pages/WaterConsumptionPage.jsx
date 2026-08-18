import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#1F4E79', '#27AE60', '#C0392B', '#E67E22', '#F1C40F', '#8E44AD', '#16A085', '#2C3E50'];

const flowLabels = {
    strong: 'Fort', normal: 'Normal', weak: 'Faible', none: 'Aucun'
};
const flowColors = {
    strong: '#27AE60', normal: '#1F4E79', weak: '#E67E22', none: '#C0392B'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 rounded shadow small"
                 style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
                <p className="fw-medium mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, margin: 0 }}>
                        {p.name}: <strong>{p.value?.toLocaleString('fr-FR')} m³</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function WaterConsumptionPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('last_consumption');

    useEffect(() => {
        api.get('/supervisions/water-consumption')
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    const { stats, by_well, by_month, by_zone } = data;

    // Filtre et tri des puits
    const filteredWells = by_well
        .filter(w => !search || 
            w.village.toLowerCase().includes(search.toLowerCase()) ||
            w.well_code.toString().includes(search) ||
            w.zone.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => b[sortBy] - a[sortBy]);

    // Données graphique mois
    const monthData = by_month.map(m => ({
        month: new Date(m.month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        total: m.total_consumption,
        moyenne: m.avg_consumption,
    }));

    // Données graphique zones
    const zoneData = by_zone.slice(0, 10).map(z => ({
        zone: z.zone.length > 15 ? z.zone.substring(0, 15) + '.' : z.zone,
        total: z.total_consumption,
        moyenne: z.avg_consumption,
    }));

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>
                Consommation d'eau
            </h4>

            {/* Cartes stats */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Consommation totale (semaine)', value: `${stats.total_consumption?.toLocaleString('fr-FR')} m³`, color: '#1F4E79' },
                    { label: 'Consommation moyenne / puits', value: `${stats.avg_consumption?.toLocaleString('fr-FR')} m³`, color: '#27AE60' },
                    { label: 'Puits avec relevé', value: stats.total_wells, color: '#E67E22' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="col-md-4">
                        <div className="card border-0 shadow-sm text-center h-100">
                            <div className="card-body py-4">
                                <div className="fs-2 fw-bold" style={{ color }}>{value}</div>
                                <div className="text-muted small">{label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphiques */}
            <div className="row g-3 mb-4">
                {/* Évolution mensuelle */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Évolution de la consommation
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthData}
                                           margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }}
                                           angle={-30} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="total" stroke="#1F4E79"
                                          strokeWidth={2} name="Total"
                                          dot={{ r: 4, fill: '#1F4E79' }} />
                                    <Line type="monotone" dataKey="moyenne" stroke="#27AE60"
                                          strokeWidth={2} name="Moyenne/puits"
                                          dot={{ r: 4, fill: '#27AE60' }} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Par zone */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white fw-medium border-bottom"
                             style={{ color: '#1F4E79' }}>
                            Consommation par zone
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={zoneData} layout="vertical"
                                          margin={{ top: 5, right: 40, left: 120, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis dataKey="zone" type="category"
                                           tick={{ fontSize: 11 }} width={120} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}
                                         label={{ position: 'right', fontSize: 10 }}>
                                        {zoneData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau des puits */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                        <span className="fw-medium" style={{ color: '#1F4E79' }}>
                            Détail par puits ({filteredWells.length} puits)
                        </span>
                        <div className="d-flex gap-2">
                            <input type="text" className="form-control form-control-sm"
                                placeholder="Rechercher village, zone..."
                                style={{ width: '200px' }}
                                value={search}
                                onChange={e => setSearch(e.target.value)} />
                            <select className="form-select form-select-sm" style={{ width: '180px' }}
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}>
                                <option value="last_consumption">Tri : Consommation ↓</option>
                                <option value="last_reading">Tri : Relevé compteur ↓</option>
                            </select>
                        </div>
                    </div>
                    <table className="table table-hover mb-0 small">
                        <thead className="table-dark-header">
                            <tr>
                                <th className="py-3 px-3">Code</th>
                                <th>Village</th>
                                <th>Zone</th>
                                <th className="text-center">Relevé (m³)</th>
                                <th className="text-center">Conso. semaine (m³)</th>
                                <th className="text-center">Débit</th>
                                <th className="text-center">Dernière visite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWells.map((w, i) => (
                                <tr key={w.well_id}
                                    style={{ backgroundColor: i % 2 === 0 ? '#F9F9F9' : '#fff' }}>
                                    <td className="px-3 fw-medium" style={{ color: '#1F4E79' }}>
                                        {w.well_code}
                                    </td>
                                    <td>{w.village}</td>
                                    <td className="text-muted small">{w.zone}</td>
                                    <td className="text-center fw-medium">
                                        {w.last_reading?.toLocaleString('fr-FR')}
                                    </td>
                                    <td className="text-center">
                                        <span className="fw-bold"
                                              style={{
                                                  color: w.last_consumption > 300 ? '#C0392B' :
                                                         w.last_consumption > 150 ? '#27AE60' : '#E67E22'
                                              }}>
                                            {w.last_consumption?.toLocaleString('fr-FR')}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge rounded-pill"
                                              style={{
                                                  backgroundColor: flowColors[w.water_flow] + '20',
                                                  color: flowColors[w.water_flow] || '#333',
                                                  fontSize: '11px'
                                              }}>
                                            {flowLabels[w.water_flow] || w.water_flow || '—'}
                                        </span>
                                    </td>
                                    <td className="text-center text-muted">
                                        {new Date(w.last_visit).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}