/**
 * CELPD — Back-office de vote (Google Apps Script → Google Sheet)
 * Stocke les candidatures et les votes de TOUS les membres dans un même classeur.
 *
 * ── Déploiement (5 min) ────────────────────────────────────────────────
 * 1. Crée un Google Sheet (il servira de base) — ex. « CELPD - Votes ».
 * 2. Menu Extensions ▸ Apps Script. Colle ce fichier (remplace le contenu).
 * 3. (Optionnel) Exécute la fonction `initSeed` une fois pour des données de démo.
 * 4. Déployer ▸ Nouveau déploiement ▸ type « Application Web ».
 *      - Exécuter en tant que : Moi
 *      - Qui a accès : Tout le monde
 *    Copie l'URL « …/exec ».
 * 5. Dans index.html, renseigne  const API_URL = "…/exec";  puis republie.
 * ───────────────────────────────────────────────────────────────────────
 */

const CAND_HEADERS = ["id","created","voteEnd","status","decided","company","sector","size",
  "tier","address","referent","referentMail","referentPhone","sponsor","motivation","domains"];
const VOTE_HEADERS = ["candidatureId","companyKey","company","vote","ts"];

function ss(){ return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, headers){
  var s = ss(), sh = s.getSheetByName(name);
  if(!sh){ sh = s.insertSheet(name); sh.appendRow(headers); }
  return sh;
}
function rows_(sh){
  var data = sh.getDataRange().getValues(); if(data.length < 2) return [];
  var head = data[0]; var out = [];
  for(var i=1;i<data.length;i++){ var o={}; for(var j=0;j<head.length;j++) o[head[j]]=data[i][j]; out.push(o); }
  return out;
}
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function getState_(){
  var cs = sheet_("Candidatures", CAND_HEADERS), vs = sheet_("Votes", VOTE_HEADERS);
  var cand = rows_(cs).filter(function(r){return r.id!=="";}).map(function(r){
    return { id:Number(r.id), created:String(r.created), voteEnd:String(r.voteEnd||""),
      status:r.status||"pending", decided:String(r.decided||""), company:r.company, sector:r.sector,
      size:r.size, tier:Number(r.tier)||0, address:r.address, referent:r.referent,
      referentMail:r.referentMail, referentPhone:r.referentPhone||"—", sponsor:r.sponsor,
      motivation:r.motivation, domains: r.domains? tryParse_(r.domains):[], votes:[] };
  });
  var byId = {}; cand.forEach(function(c){ byId[c.id]=c; });
  rows_(vs).forEach(function(v){ var c=byId[Number(v.candidatureId)];
    if(c) c.votes.push({ by:String(v.companyKey), company:String(v.company), v:String(v.vote), c:"" }); });
  cand.sort(function(a,b){ return b.id-a.id; });
  var maxId = cand.reduce(function(m,c){ return Math.max(m,c.id); }, 0);
  return { candidatures: cand, seq: maxId+1 };
}
function tryParse_(s){ try{ return JSON.parse(s); }catch(e){ return String(s).split("|"); } }

function addVote_(p){
  var vs = sheet_("Votes", VOTE_HEADERS);
  var exists = rows_(vs).some(function(v){
    return Number(v.candidatureId)===Number(p.candidatureId) && String(v.companyKey)===String(p.companyKey); });
  if(!exists) vs.appendRow([Number(p.candidatureId), p.companyKey, p.company, p.vote, new Date().toISOString()]);
}
function addCandidature_(c){
  var cs = sheet_("Candidatures", CAND_HEADERS);
  var maxId = rows_(cs).reduce(function(m,r){ return Math.max(m, Number(r.id)||0); }, 0);
  var id = maxId+1;
  cs.appendRow([id, c.created, c.voteEnd||"", "pending", "", c.company, c.sector, c.size||"—",
    c.tier||0, c.address, c.referent, c.referentMail, c.referentPhone||"—", c.sponsor||"",
    c.motivation, JSON.stringify(c.domains||[])]);
  return id;
}

function doGet(e){ return json_(getState_()); }
function doPost(e){
  var lock = LockService.getScriptLock(); lock.waitLock(20000); // évite les écritures concurrentes
  try{
    var body = JSON.parse(e.postData.contents);
    if(body.action==="vote")            addVote_(body);
    else if(body.action==="candidature") addCandidature_(body.candidature);
    return json_(getState_());
  } finally { lock.releaseLock(); }
}

/** Vide les deux onglets puis recrée la candidature test. À exécuter depuis l'éditeur. */
function resetAll(){
  var s = ss();
  ["Candidatures","Votes"].forEach(function(n){ var sh=s.getSheetByName(n); if(sh) s.deleteSheet(sh); });
  sheet_("Candidatures", CAND_HEADERS); sheet_("Votes", VOTE_HEADERS);
  initSeed();
}

/** Les 2 candidatures réelles à soumettre au vote — exécuter une seule fois (ou via resetAll). */
function initSeed(){
  addCandidature_({created:"2026-07-20",voteEnd:"2026-08-24",company:"Association MC2A — Promeom",
    sector:"Santé au travail — SPSTI (prévention & santé au travail interentreprises)",size:"≈ 600 salariés (groupe)",
    tier:300,address:"20 boulevard Eugène Deruelle, 69003 Lyon (Le Britannia)",
    referent:"Marlène Piriou (animatrice CELPD)",referentMail:"contact@clubpartdieu.fr",referentPhone:"—",sponsor:"",
    motivation:"Issue de la fusion Agemetra / AST Grand Lyon au 01/01/2025, Promeom est le 1er opérateur de santé au travail en Auvergne-Rhône-Alpes, avec plusieurs centres dans le 3e arrondissement. Cotisation annoncée : 300 € HT (hors grille standard — palier le plus proche : 350 €).",
    domains:["Ressources humaines","Développement durable / RSE"]});
  addCandidature_({created:"2026-07-20",voteEnd:"2026-08-24",company:"Les Ateliers de l'Audace",
    sector:"Chantier d'insertion — réparation/vente de vélos reconditionnés, mobilité douce en entreprise",size:"35 salariés",
    tier:-1,address:"141 rue Pierre Corneille, 69003 Lyon",
    referent:"Bénédicte Moreau",referentMail:"bmoreau@ateliersdelaudace.fr",referentPhone:"—",sponsor:"",
    motivation:"Identifier des employeurs pour des salariés en insertion et promouvoir la mobilité douce (vélo) auprès des adhérents du CELPD. Palier de cotisation à confirmer avec l'animatrice avant décision.",
    domains:["Mobilité (PMIE)","Ressources humaines","Développement durable / RSE"]});
}
