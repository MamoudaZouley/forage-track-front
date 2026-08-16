import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import ExportButton from '../components/ExportButton';

const gradeConfig = {
    ABSENT:    { color: '#595959', bg: '#F2F2F2' },
    CRITICAL:  { color: '#C00000', bg: '#FCE4D6' },
    LOW:       { color: '#E26B0A', bg: '#FDE9D9' },
    PARTIAL:   { color: '#BF8F00', bg: '#FFF2CC' },
    GOOD:      { color: '#2E75B6', bg: '#DEEAF1' },
    EXCELLENT: { color: '#375623', bg: '#E2EFDA' },
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

    const gradeSummary = stats.reduce((acc, s) => {
        acc[s.grade] = (acc[s.grade] || 0) + 1;
        return acc;
    }, {});

    return (
        <Layout>
            {/* Filtre mois */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0" style={{ color: '#1F4E79' }}>
                    KPI Mensuel Superviseurs
                </h4>
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
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0 small">
                            {/* Titre comme rapport Python */}
                            <thead>
                                <tr>
                                    <th colSpan="15" className="text-center py-3"
                                        style={{ backgroundColor: '#1F3864', color: '#fff', fontSize: '13px' }}>
                                        SUQYA — Rapport KPI Superviseurs | {month} | Région Maradi
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan="15" className="py-2 px-3"
                                        style={{ backgroundColor: '#EBF3FB', color: '#1F4E79', fontSize: '11px', fontStyle: 'italic' }}>
                                        Règles : (1) 1 visite/puits/semaine | (2) Min 4 jours entre visites | (3) Puits assignés uniquement | Semaines : S1=01-07 | S2=08-14 | S3=15-21 | S4=22-fin | Cible : 4 semaines × nb puits
                                    </th>
                                </tr>
                               <tr>
                                    <th className="text-center py-2" style={{ backgroundColor: '#1F3864', color: '#fff', width: '30px' }}>#</th>
                                    <th className="py-2" style={{ backgroundColor: '#1F3864', color: '#fff' }}>Superviseur</th>
                                    <th className="py-2" style={{ backgroundColor: '#1F3864', color: '#fff' }}>Zone</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>Puits<br/>assignés</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>Cible</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>Soumis</th>
                                    <th className="text-center" style={{ backgroundColor: '#C00000', color: '#fff' }}>
                                        ✕ Doublons<br/>même semaine
                                    </th>
                                    <th className="text-center" style={{ backgroundColor: '#C00000', color: '#fff' }}>
                                        ✕ Gap<br/>&lt;4 jours
                                    </th>
                                    <th className="text-center" style={{ backgroundColor: '#375623', color: '#fff' }}>
                                        ✓ Visites<br/>valides
                                    </th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>S1<br/>(01-07)</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>S2<br/>(08-14)</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>S3<br/>(15-21)</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>S4<br/>(22-fin)</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>KPI %</th>
                                    <th className="text-center" style={{ backgroundColor: '#1F3864', color: '#fff' }}>Grade</th>
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
                                            <td className="text-muted small">{sup.zone}</td>
                                            <td className="text-center">{sup.assigned_wells}</td>
                                            <td className="text-center">{sup.target}</td>
                                            <td className="text-center">{sup.raw_submitted}</td>
                                            <td className="text-center"
                                                style={{
                                                    backgroundColor: sup.duplicates > 0 ? '#FFF2CC' : '',
                                                    color: sup.duplicates > 0 ? '#C00000' : '#888'
                                                }}>
                                                {sup.duplicates}
                                            </td>
                                            <td className="text-center"
                                                style={{
                                                    backgroundColor: sup.gap_violations > 0 ? '#FFF2CC' : '',
                                                    color: sup.gap_violations > 0 ? '#C00000' : '#888'
                                                }}>
                                                {sup.gap_violations}
                                            </td>
                                            <td className="text-center fw-bold"
                                                style={{ color: '#375623' }}>
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
                                                <span className="badge rounded-pill px-2 fw-bold"
                                                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                                    {sup.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: '#D9E1F2' }}>
                                    <td colSpan="3" className="fw-bold px-3">TOTAL</td>
                                    <td className="text-center fw-bold">{totals.assigned_wells}</td>
                                    <td className="text-center fw-bold">{totals.target}</td>
                                    <td className="text-center fw-bold">{totals.raw_submitted}</td>
                                    <td className="text-center fw-bold"
                                        style={{ color: totals.duplicates > 0 ? '#C00000' : '#333' }}>
                                        {totals.duplicates}
                                    </td>
                                    <td className="text-center fw-bold"
                                        style={{ color: totals.gap_violations > 0 ? '#C00000' : '#333' }}>
                                        {totals.gap_violations}
                                    </td>
                                    <td className="text-center fw-bold" style={{ color: '#375623' }}>
                                        {totals.valid_visits}
                                    </td>
                                    <td className="text-center fw-bold">{totals.w1}</td>
                                    <td className="text-center fw-bold">{totals.w2}</td>
                                    <td className="text-center fw-bold">{totals.w3}</td>
                                    <td className="text-center fw-bold">{totals.w4}</td>
                                    <td className="text-center fw-bold">{totals.kpi_percent}%</td>
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