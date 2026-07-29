# Mettre à jour le vote — directement depuis ton Google Sheet

Le site lit **en direct** ton Google Sheet. Pour modifier les candidatures ou le sondage,
tu édites simplement le classeur — **aucun code à toucher**.

**Ton classeur :** https://docs.google.com/spreadsheets/d/1h7TgWLo03EllOhA7Sfs8tSOIVIYmOHMwzA1H2g739Nk/edit
**Le site :** https://vbouin.github.io/celpd-vote/  (code d'accès : `CELPD26#`)

## Onglet « Candidatures »
Une ligne = une entreprise. Colonnes utiles :

| Colonne | À mettre |
|---|---|
| `company` | Nom affiché (ex. « Accor ») |
| `sector` | Secteur d'activité |
| `status` | **`pending`** = à voter · **`sondage`** = va dans la section Sondage · `accepted` / `rejected` = historique |
| `voteEnd` | Date de fin de vote (AAAA-MM-JJ) |
| `tier` | Palier de cotisation (nombre) · `-1` = « À confirmer » |
| `address`, `referent`, `referentMail`, `motivation` | Infos affichées |
| `domains` | Thématiques, au format `["Immobilier","Innovation / IA"]` (ou laisser `[]`) |
| `id` | Numéro unique (mets le suivant : 8, 9, …) |

### Gestes courants
- **Ajouter une entreprise** : nouvelle ligne, remplis `company` + `sector` + `status` = `pending` + un `id` unique.
- **Basculer une entreprise dans le Sondage** : mets `sondage` dans sa colonne `status`.
- **Retirer une entreprise** : supprime sa ligne.
- **Changer la date limite / le nom / l'adresse** : édite la cellule.

> Le site se met à jour tout seul au rechargement de la page (rien à republier).

## Onglet « Votes »
Rempli automatiquement quand les membres votent (companyKey = entreprise, vote = for/against/abstain).
Tu peux le consulter/exporter, mais évite d'y toucher à la main.

## Logo & fiche d'une nouvelle entreprise
Le logo et la petite fiche sont associés **par le nom** de l'entreprise, côté site.
Pour une entreprise vraiment nouvelle, envoie-moi son nom + site et je l'ajoute (logo + fiche) en 1 minute.

## Repartir de zéro (optionnel)
Si un jour tu veux tout réinitialiser proprement (vider + recréer la liste), ouvre
`Extensions ▸ Apps Script`, colle `apps-script/Code.gs` (du dépôt) et lance la fonction **`resetAll`**.
Mais au quotidien, **édite juste le Sheet** — c'est le plus simple.
