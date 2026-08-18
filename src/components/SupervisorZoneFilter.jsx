import { useState, useEffect } from 'react';
import api from '../services/api';

export default function SupervisorZoneFilter({ filters, setFilters }) {
    const [options, setOptions] = useState({ supervisors: [], zones: [] });

    useEffect(() => {
        api.get('/wells/filters').then(res => setOptions(res.data));
    }, []);

    return (
        <>
            <div className="col-md-2">
                <label className="form-label small mb-1">Superviseur</label>
                <select className="form-select form-select-sm"
                        value={filters.supervisor || ''}
                        onChange={e => setFilters({ ...filters, supervisor: e.target.value })}>
                    <option value="">Tous</option>
                    {options.supervisors.map(s => (
                        <option key={s.username} value={s.username}>{s.name}</option>
                    ))}
                </select>
            </div>
            <div className="col-md-2">
                <label className="form-label small mb-1">Zone</label>
                <select className="form-select form-select-sm"
                        value={filters.zone || ''}
                        onChange={e => setFilters({ ...filters, zone: e.target.value })}>
                    <option value="">Toutes</option>
                    {options.zones.map(z => (
                        <option key={z} value={z}>{z}</option>
                    ))}
                </select>
            </div>
        </>
    );
}