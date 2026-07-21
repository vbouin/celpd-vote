# CELPD — Espace de vote des candidatures

Application **une seule page**, autonome, pour le vote des candidatures d'adhésion au
**Club des Entreprises Lyon Part‑Dieu**. Créé par [Exoflow](https://exoflow.fr) — outils métiers IA.

- `index.html` — l'application (à héberger telle quelle).
- `index.template.html` + `build.py` — source (build = simple copie).
- `assets/celpd-logo.png` — logo « carte du quartier ».
- `apps-script/Code.gs` — back‑office de vote partagé (Google Sheet).

## Fonctionnement
- Accueil : **nom de l'entreprise** + **code d'accès** (`CELPD26#`).
- Page unique : candidatures **à voter** (une entreprise = **un vote**, avec **date de fin de vote**),
  **historique & résultats**, et **visualisation des votes**.
- **+ Candidature** (dépôt, avec date de fin ≤ **5 semaines**) et **⇩ Export** CSV.

## 💾 Sauvegarde des votes — deux modes
Le fichier `index.html` contient une constante `API_URL` (tout en haut du script) :

| `API_URL` | Mode | Où sont les votes |
|-----------|------|-------------------|
| **vide** `""` | Local | Dans le `localStorage` de **chaque** navigateur → **non partagés** (bon pour une démo). |
| **rempli** | Partagé | Dans un **Google Sheet** commun → **tous les membres votent sur la même base**. |

### Activer le vote partagé (Google Sheet + Apps Script)
1. Crée un Google Sheet (ex. « CELPD - Votes »).
2. `Extensions ▸ Apps Script`, colle le contenu de [`apps-script/Code.gs`](apps-script/Code.gs).
3. (option) exécute `initSeed` une fois pour des données de démo.
4. `Déployer ▸ Nouveau déploiement ▸ Application Web` → *Exécuter en tant que : Moi*, *Accès : Tout le monde*. Copie l'URL `…/exec`.
5. Dans `index.template.html`, mets `const API_URL = "…/exec";` puis `python3 build.py`, et republie.

Le Club **possède** ses données (dans son Drive), c'est gratuit, et le Sheet est lisible/auditable
(feuilles *Candidatures* et *Votes*). Un `LockService` évite les écritures concurrentes ;
un même **companyKey** ne peut voter qu'une fois par candidature (contrôle aussi côté serveur).

## 🌐 Mettre en ligne (GitHub Pages)
```bash
cd celpd-vote
git init && git add . && git commit -m "CELPD — espace de vote"
gh repo create celpd-vote --public --source=. --push
# Pages : Settings ▸ Pages ▸ Deploy from a branch ▸ main / (root)
```
L'URL publique servira `index.html`.

## ⚠️ Sécurité
- Le code `CELPD26#` est **dans le code source** (dépôt public) : c'est un filtre de confort, **pas** une sécurité.
- L'export CSV neutralise l'injection de formule ; les entrées utilisateur sont échappées (anti‑XSS).
- Le Web App Apps Script est en accès « Tout le monde » : n'y stocke **pas** de données sensibles.
  Pour durcir : lien magique / vérification d'appartenance côté serveur.

## Vidéo de fond sur la page de connexion
Dépose une vidéo **`assets/celpd-login.mp4`** (muette, quelques secondes, bouclée) : elle s'affiche
en fond de l'écran de connexion, derrière un voile teal qui garde le texte lisible.
Sans fichier, l'écran garde son dégradé (aucune erreur). Formats conseillés : MP4 H.264, < 8 Mo.

## E‑mail aux adhérents
Un modèle prêt à envoyer est fourni dans [`email-adherents.md`](email-adherents.md)
(invitation à voter + mode d'emploi + lien + code).

## Remplacer le logo
Dépose ton image dans `assets/` et, dans `index.template.html`, adapte la constante `LOGO`
(actuellement `<img src="assets/celpd-logo.png">`), puis `python3 build.py`.
