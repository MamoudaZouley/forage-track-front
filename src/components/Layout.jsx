import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F8F8F7' }}>

            {/* Sidebar */}
            <div className="d-flex flex-column p-3"
                 style={{ width: '220px', backgroundColor: '#1F4E79', minHeight: '100vh', position: 'fixed' }}>

                {/* Logo */}
                <div className="text-white fw-bold fs-6 mb-4 mt-2 text-center">
                    💧 ForageTrack
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                {/* Navigation */}
                <nav className="flex-grow-1">
                    <NavLink to="/" end className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        📊 Tableau de bord
                    </NavLink>

                    <NavLink to="/wells" className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        🔵 Puits
                    </NavLink>

                    <NavLink to="/alerts" className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        ⚠️ Alertes
                    </NavLink>
                    <NavLink to="/maintenances" className={({ isActive }) =>
                       `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                       style={({ isActive }) => ({
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                          color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                       🔧 Maintenances
                    </NavLink>
                    <NavLink to="/technicians" className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        🔧 Techniciens
                    </NavLink>
                    <NavLink to="/supervisors" className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        👷 Superviseurs
                    </NavLink>
                    <NavLink to="/kpi" className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        📊 KPI Mensuel
                    </NavLink>
                    <NavLink to="/water" className={({ isActive }) =>
                        `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                            color: isActive ? '#fff' : '#9FC8E8'
                        })}>
                        💧 Consommation eau
                    </NavLink>
                    <NavLink to="/statistics" className={({ isActive }) =>
                       `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                        color: isActive ? '#fff' : '#9FC8E8'
                       })}>
                       📈 Statistiques
                    </NavLink>


                    {user?.role === 'admin' && (
                        <NavLink to="/users" className={({ isActive }) =>
                            `d-block text-decoration-none py-2 px-3 rounded mb-1 small ${isActive ? 'fw-bold' : ''}`}
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                color: isActive ? '#fff' : '#9FC8E8'
                            })}>
                            👥 Utilisateurs
                        </NavLink>
                    )}
                </nav>

                {/* Déconnexion */}
                <div className="mt-auto">
                    <div className="text-white small mb-2 px-3 opacity-75">
                        {user?.name}
                        <span className={`badge ms-2 ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {user?.role}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-sm w-100 text-white"
                        style={{ backgroundColor: '#C0392B' }}>
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Zone principale */}
            <div style={{ marginLeft: '220px', flex: 1 }}>

                {/* Navbar */}
                <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
                     style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                    <div>
                        <span className="fw-medium" style={{ color: '#1F4E79' }}>ForageTrack</span>
                    </div>
                    <div className="text-muted small">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}