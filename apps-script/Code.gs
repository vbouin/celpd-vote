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

/** (Optionnel) Données de démo — à exécuter une seule fois. */
function initSeed(){
  addCandidature_({created:"2026-06-18",voteEnd:"2026-07-23",company:"Atelier Kairos",sector:"Architecture d'intérieur",
    size:"12 salariés",tier:350,address:"Tour Oxygène, 69003 Lyon",referent:"Léa Marchand",
    referentMail:"lea.marchand@atelierkairos.fr",sponsor:"Kardham",motivation:"Ateliers Immobilier.",
    domains:["Immobilier","Innovation / IA"]});
  addVote_({candidatureId:1,companyKey:"co:kardham",company:"Kardham",vote:"for"});
}
