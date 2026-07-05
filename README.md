# ForageTrack Frontend

Interface React 18 pour le suivi des puits d'eau et supervisions de terrain.

## Technologies

- React 18
- Vite
- React Router 6
- Axios
- Bootstrap 5

## Installation

```bash
git clone https://github.com/MamoudaZouley/forage-track-front.git
cd forage-track-front
npm install
npm run dev
```

L'application sera accessible sur http://localhost:5173

## Prérequis

Le backend ForageTrack API doit tourner sur http://127.0.0.1:8000

## Pages

- /login — Connexion
- / — Tableau de bord
- /wells — Liste des puits
- /wells/:id — Fiche d'un puits
- /wells/:id/supervisions/:supId — Détail supervision
- /alerts — Liste des alertes
- /users — Gestion utilisateurs (admin)