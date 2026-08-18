import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        <span className="badge rounded-pill"
              style={{ backgroundColor: c.color, color: c.text, fontSize: '11px' }}>
            {c.label}
        </span>
    );
}

export default function WellsListPage() {
    const [wells, setWells] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ region: '', status: '', search: '' });
    const [page, setPage] = useState(1);

    const fetchWells = (p = 1, f = filters) => {
        setLoading(true);
        const params = { page: p, ...f };
        api.get('/wells', { params })
            .then(res => {
                setWells(res.data.data);
                setMeta(res.data);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchWells(); }, []);

    const handleFilter = (e) => {
        e.preventDefault();
        setPage(1);
        fetchWells(1, filters);
    };

    const handleReset = () => {
        const reset = { region: '', status: '', search: '' };
        setFilters(reset);
        setPage(1);
        fetchWells(1, reset);
    };

    return (
        <Layout>
            <h4 className="fw-bold mb-4" style={{ color: '#1F4E79' }}>Liste des puits</h4>

            {/* Filtres */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body py-3">
                    <form className="row g-2 align-items-end" onSubmit={handleFilter}>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Région</label>
                            <select className="form-select form-select-sm"
                                    value={filters.region}
                                    onChange={e => setFilters({ ...filters, region: e.target.value })}>
                                <option value="">Toutes les régions</option>
                                <option value="Maradi">Maradi</option>
                                <option value="Zinder">Zinder</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small mb-1">Statut</label>
                            <select className="form-select form-select-sm"
                                    value={filters.status}
                                    onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                <option value="">Tous les statuts</option>
                                <option value="operational">Opérationnel</option>
                                <option value="not_working">En panne</option>
                                <option value="suspended">Suspendu</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small mb-1">Recherche</label>
                            <input type="text"
                                   className="form-control form-control-sm"
                                   placeholder="Code ou village..."
                                   value={filters.search}
                                   onChange={e => setFilters({ ...filters, search: e.target.value })} />
                        </div>
                        <div className="col-md-2 d-flex gap-2">
                            <button type="submit" className="btn btn-sm text-white w-100"
                                    style={{ backgroundColor: '#1F4E79' }}>
                                Filtrer
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={handleReset}>
                                ✕
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Tableau */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-4">Chargement...</div>
                    ) : (
                        <table className="table table-hover mb-0 small" >
                            <thead className="table-dark-header"> 
                                <tr>
                                    <th className="text-white fw-medium py-3 px-3">Code</th>
                                    <th className="text-white fw-medium">Village</th>
                                    <th className="text-white fw-medium">Région</th>
                                    <th className="text-white fw-medium">Département</th>
                                    <th className="text-white fw-medium">Statut</th>
                                    <th className="text-white fw-medium">Supervisions</th>
                                    <th className="text-white fw-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wells.map((well, i) => (
                                    <tr key={well.id}
                                        style={{ backgroundColor: i % 2 === 0 ? '#F9F9F9' : '#fff' }}>
                                        <td className="px-3 fw-medium" style={{ color: '#1F4E79' }}>
                                            {well.code}
                                        </td>
                                        <td>{well.village}</td>
                                        <td>{well.region}</td>
                                        <td>{well.department}</td>
                                        <td><StatusBadge status={well.status} /></td>
                                        <td className="text-center">{well.supervisions_count}</td>
                                        <td>
                                            <Link to={`/wells/${well.id}`}
                                                  className="btn btn-sm text-white"
                                                  style={{ backgroundColor: '#1F4E79', fontSize: '11px' }}>
                                                Voir →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center small">
                        <span className="text-muted">
                            {meta.from}–{meta.to} sur {meta.total} puits
                        </span>
                        <div className="d-flex gap-1">
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                                <button key={p}
                                        onClick={() => { setPage(p); fetchWells(p); }}
                                        className="btn btn-sm"
                                        style={{
                                            backgroundColor: p === meta.current_page ? '#1F4E79' : '#F5F5F5',
                                            color: p === meta.current_page ? '#fff' : '#333',
                                            minWidth: '32px'
                                        }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}