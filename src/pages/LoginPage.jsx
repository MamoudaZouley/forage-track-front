import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: '#F8F8F7' }}>
            <div className="card shadow" style={{ width: '420px' }}>
                <div className="card-body p-4">

                    {/* Logo */}
                    <div className="text-center mb-4">
                        <div className="rounded p-3 d-inline-block mb-2"
                             style={{ backgroundColor: '#1F4E79' }}>
                            <span className="text-white fw-bold fs-5">💧 ForageTrack</span>
                        </div>
                        <p className="text-muted small">Connectez-vous à votre compte</p>
                    </div>

                    {/* Erreur */}
                    {error && (
                        <div className="alert alert-danger py-2 small">{error}</div>
                    )}

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label small fw-medium">Adresse email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="exemple@forage.ne"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-medium">Mot de passe</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 text-white fw-medium"
                            style={{ backgroundColor: '#1F4E79' }}
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Info accès */}
                    <div className="mt-3 p-2 rounded small text-center"
                         style={{ backgroundColor: '#EAF3FB' }}>
                        <span style={{ color: '#1F4E79' }}>
                            <strong>Accès réservé</strong> — Comptes créés par l'administrateur
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}