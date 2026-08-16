import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const gradeConfig = {
    ABSENT: { color: '#C0392B', bg: '#FDECEC', label: 'ABSENT' },
    CRITICAL: { color: '#E74C3C', bg: '#FDECEC', label: 'CRITICAL' },
    LOW: { color: '#E67E22', bg: '#FEF3E7', label: 'LOW' },
    MEDIUM: { color: '#F1C40F', bg: '#FFFDE7', label: 'MEDIUM' },
    GOOD: { color: '#27AE60', bg: '#E8F8EF', label: 'GOOD' },
    EXCELLENT: { color: '#1F4E79', bg: '#EAF3FB', label: 'EXCELLENT' },
};

export default function KpiSupervisorsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    const fetchKpi = (m) => {
        setLoading(true);
        api.get(`/supervisions/kpi?month=${m}`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchKpi(month); }, []);

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
        fetchKpi(e.target.value);
    };

    if (loading) return <Layout><div className="text-center mt-5">Chargement...</div></Layout>;

    const { stats, totals } = data;

    // Résumé des grades
    const gradeSummary = stats.reduce((acc, s) => {
        acc[s.grade] = (acc[s.grade] || 0) + 1;
        return acc;
    }, {});

    return (
        <Layout>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1F4E79' }}>
                        KPI Superviseurs — Rapport mensuel
                    </h4>
                    <div className="text-muted small">
                        Règles : (1) 1 visite/puits/semaine · (2) Min 4 jours entre visites · (3) Puits assignés uniquement · Cible : 4 visites/puits/mois
                    </div>
                </div>
                <input type="month" className="form-control" style={{ width: '180px' }}
                       value={month} onChange={handleMonthChange} />
            </div>

            {/* Résumé grades */}
            <div className="row g-2 mb-4">
                {Object.entries(gradeConfig).map(([grade, cfg]) => (
                    <div key={grade} className="col">
                        <div className="card border-0 shadow-sm text-center py-2"
                             style={{ borderTop: `3px solid ${cfg.color}` }}>
                            <div className="fs-4 fw-bold" style={{ color: cfg.color }}>
                                {gradeSummary[grade] || 0}
                            </div>
                            <div className="small" style={{ color: cfg.color }}>{grade}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tableau KPI */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <span className="fw-medium" style={{ color: '#1F4E79' }}>
                        SUQYA — Supervisor KPI Report | {month} | Maradi Region
                    </span>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0 small">
                            <thead>
                                <tr style={{ backgroundColor: '#1F4E79' }}>
                                    <th className="text-white fw-medium py-2 px-2">#</th>
                                    <th className="text-white fw-medium">Superviseur</th>
                                    <th className="text-white fw-medium">Zone</th>
                                    <th className="text-white fw-medium text-center">Puits assignés</th>
                                    <th className="text-white fw-medium text-center">Cible</th>
                                    <th className="text-white fw-medium text-center">Soumis</th>
                                    <th className="text-white fw-medium text-center" style={{ backgroundColor: '#C0392B' }}>
                                        ✕ Doublons
                                    </th>
                                    <th className="text-white fw-medium text-center" style={{ backgroundColor: '#C0392B' }}>
                                        ✕ Gap &lt;4j
                                    </th>
                                    <th className="text-white fw-medium text-center" style={{ backgroundColor: '#27AE60' }}>
                                        ✓ Valides
                                    </th>
                                    <th className="text-white fw-medium text-center">W1</th>
                                    <th className="text-white fw-medium text-center">W2</th>
                                    <th className="text-white fw-medium text-center">W3</th>
                                    <th className="text-white fw-medium text-center">W4</th>
                                    <th className="text-white fw-medium text-center">KPI%</th>
                                    <th className="text-white fw-medium text-center">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((sup, i) => {
                                    const cfg = gradeConfig[sup.grade] || gradeConfig.ABSENT;
                                    return (
                                        <tr key={sup.username}
                                            style={{ backgroundColor: i % 2 === 0 ? '#F9F9F9' : '#fff' }}>
                                            <td className="text-center text-muted">{i + 1}</td>
                                            <td className="fw-medium">{sup.name}</td>
                                            <td className="text-muted">{sup.zone}</td>
                                            <td className="text-center">{sup.assigned_wells}</td>
                                            <td className="text-center">{sup.target}</td>
                                            <td className="text-center">{sup.raw_submitted}</td>
                                            <td className="text-center"
                                                style={{ color: sup.duplicates > 0 ? '#C0392B' : '#888' }}>
                                                {sup.duplicates}
                                            </td>
                                            <td className="text-center"
                                                style={{ color: sup.gap_violations > 0 ? '#C0392B' : '#888' }}>
                                                {sup.gap_violations}
                                            </td>
                                            <td className="text-center fw-medium"
                                                style={{ color: '#27AE60' }}>
                                                {sup.valid_visits}
                                            </td>
                                            <td className="text-center">{sup.w1}</td>
                                            <td className="text-center">{sup.w2}</td>
                                            <td className="text-center">{sup.w3}</td>
                                            <td className="text-center">{sup.w4}</td>
                                            <td className="text-center fw-bold"
                                                style={{ color: cfg.color }}>
                                                {sup.kpi_percent}%
                                            </td>
                                            <td className="text-center">
                                                <span className="badge rounded-pill px-2"
                                                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                                    {sup.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: '#1F4E79' }}>
                                    <td colSpan="3" className="text-white fw-bold px-2">TOTAL</td>
                                    <td className="text-white text-center fw-bold">{totals.assigned_wells}</td>
                                    <td className="text-white text-center fw-bold">{totals.target}</td>
                                    <td className="text-white text-center fw-bold">{totals.raw_submitted}</td>
                                    <td className="text-white text-center fw-bold">{totals.duplicates}</td>
                                    <td className="text-white text-center fw-bold">{totals.gap_violations}</td>
                                    <td className="text-white text-center fw-bold">{totals.valid_visits}</td>
                                    <td className="text-white text-center fw-bold">{totals.w1}</td>
                                    <td className="text-white text-center fw-bold">{totals.w2}</td>
                                    <td className="text-white text-center fw-bold">{totals.w3}</td>
                                    <td className="text-white text-center fw-bold">{totals.w4}</td>
                                    <td className="text-white text-center fw-bold">{totals.kpi_percent}%</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}