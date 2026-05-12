# KoraMarco

Application de recettes haute protéine — Nutrition · Performance

## Déploiement GitHub → Vercel

### 1. GitHub
1. Va sur github.com → **New repository**
2. Nom : `koramarco` → **Create repository**
3. Sur la page du repo vide, clique **uploading an existing file**
4. Glisse tous les fichiers du dossier `koramarco` (en conservant la structure)
5. Commit → **Commit changes**

### 2. Vercel
1. Va sur vercel.com → **Add New Project**
2. Importe le repo GitHub `koramarco`
3. Framework preset : **Vite** (détecté automatiquement)
4. **Deploy**

Ton app est en ligne sur `koramarco.vercel.app`

### Mettre à jour une recette
1. Modifie `src/App.jsx` sur GitHub (bouton crayon)
2. Commit → Vercel redéploie automatiquement en 30 sec
