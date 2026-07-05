import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchUsers = () => {
        setLoading(true);
        api.get('/users')
            .then(res => setUsers(res.data.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const openAdd = () => {
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'user' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            if (editUser) {
                const data = { name: form.name, email: form.email, role: form.role };
                if (form.password) data.password = form.password;
                await api.put(`/users/${editUser.id}`, data);
            } else {
                await api.post('/users', form);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Supprimer ${user.name} ?`)) return;
        await api.delete(`/users/${user.id}`);
        fetchUsers();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0" style={{ color: '#1F4E79' }}>
                    Gestion des utilisateurs
                </h4>
                <button onClick={openAdd}
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#1F4E79' }}>
                    + Ajouter un utilisateur
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-4">Chargement...</div>
                    ) : (
                        <table className="table table-hover mb-0 small">
                            <thead style={{ backgroundColor: '#1F4E79' }}>
                                <tr>
                                    <th className="text-white fw-medium py-3 px-3">Nom</th>
                                    <th className="text-white fw-medium">Email</th>
                                    <th className="text-white fw-medium">Rôle</th>
                                    <th className="text-white fw-medium">Créé le</th>
                                    <th className="text-white fw-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <tr key={user.id}
                                        style={{ backgroundColor: i % 2 === 0 ? '#F9F9F9' : '#fff' }}>
                                        <td className="px-3 fw-medium">{user.name}</td>
                                        <td className="text-muted">{user.email}</td>
                                        <td>
                                            <span className="badge rounded-pill"
                                                  style={{
                                                      backgroundColor: user.role === 'admin' ? '#EAF3FB' : '#F0F0F0',
                                                      color: user.role === 'admin' ? '#1F4E79' : '#555'
                                                  }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-muted">
                                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td>
                                            <button onClick={() => openEdit(user)}
                                                    className="btn btn-sm me-1"
                                                    style={{ backgroundColor: '#FEF3E7', color: '#E67E22', fontSize: '11px' }}>
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(user)}
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: '#FDECEC', color: '#C0392B', fontSize: '11px' }}>
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header text-white border-0"
                                 style={{ backgroundColor: '#1F4E79' }}>
                                <h6 className="modal-title fw-bold">
                                    {editUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                                </h6>
                                <button onClick={() => setShowModal(false)}
                                        className="btn-close btn-close-white" />
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    {error && (
                                        <div className="alert alert-danger py-2 small">{error}</div>
                                    )}
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-medium">Nom complet</label>
                                            <input type="text"
                                                   className="form-control form-control-sm"
                                                   value={form.name}
                                                   onChange={e => setForm({ ...form, name: e.target.value })}
                                                   required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-medium">Email</label>
                                            <input type="email"
                                                   className="form-control form-control-sm"
                                                   value={form.email}
                                                   onChange={e => setForm({ ...form, email: e.target.value })}
                                                   required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-medium">
                                                Mot de passe {editUser && '(laisser vide = inchangé)'}
                                            </label>
                                            <input type="password"
                                                   className="form-control form-control-sm"
                                                   value={form.password}
                                                   onChange={e => setForm({ ...form, password: e.target.value })}
                                                   minLength={editUser ? 0 : 8}
                                                   required={!editUser} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-medium">Rôle</label>
                                            <select className="form-select form-select-sm"
                                                    value={form.role}
                                                    onChange={e => setForm({ ...form, role: e.target.value })}>
                                                <option value="user">Utilisateur</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button"
                                            onClick={() => setShowModal(false)}
                                            className="btn btn-sm btn-outline-secondary">
                                        Annuler
                                    </button>
                                    <button type="submit"
                                            disabled={saving}
                                            className="btn btn-sm text-white"
                                            style={{ backgroundColor: '#1F4E79' }}>
                                        {saving ? 'Enregistrement...' : editUser ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}