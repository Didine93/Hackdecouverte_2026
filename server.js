// Serveur LienClair — Node 18+, aucune dépendance.
// Lancer (PowerShell) : $env:VT_API_KEY="votre_cle"; node server.js  → http://localhost:3000
// HTTPS (facultatif) : $env:TLS_CERT="localhost+1.pem"; $env:TLS_KEY="localhost+1-key.pem"
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const TLS = process.env.TLS_CERT && process.env.TLS_KEY
  ? { cert: fs.readFileSync(process.env.TLS_CERT), key: fs.readFileSync(process.env.TLS_KEY) } : null;
const KEY = process.env.VT_API_KEY, PORT = process.env.PORT || 3000;
const VT = 'https://www.virustotal.com/api/v3';
const hits = new Map(); // limitation simple : 8 analyses / minute / IP

const vt = (p, opt = {}) => fetch(VT + p, { ...opt, headers: { 'x-apikey': KEY, ...(opt.headers || {}) } });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function analyse(url) {
  const sub = await vt('/urls', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'url=' + encodeURIComponent(url) });
  if (!sub.ok) throw new Error('VirusTotal a refusé la requête (' + sub.status + ')');
  const id = (await sub.json()).data.id;
  let a;
  for (let i = 0; i < 12; i++) {
    a = (await (await vt('/analyses/' + id)).json()).data.attributes;
    if (a.status === 'completed') break;
    await sleep(2000);
  }
  const flagged = Object.values(a.results || {})
    .filter(r => r.category === 'malicious' || r.category === 'suspicious')
    .map(r => ({ engine: r.engine_name, category: r.category, result: r.result }));
  const out = { stats: a.stats, flagged, completed: a.status === 'completed' };
  const b64 = Buffer.from(url).toString('base64url');
  out.link = 'https://www.virustotal.com/gui/url/' + b64;
  try { // informations complémentaires (facultatives)
    const u = (await (await vt('/urls/' + b64)).json()).data.attributes;
    out.reputation = u.reputation; out.categories = u.categories;
    const host = new URL(url).hostname;
    const d = (await (await vt('/domains/' + host)).json()).data.attributes;
    out.domain = { registrar: d.registrar, created: d.creation_date, reputation: d.reputation, tld: d.tld };
  } catch (e) { /* ignoré */ }
  return out;
}

const handler = async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (TLS) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' blob:");
    return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }
  if (req.method === 'GET' && req.url === '/jsQR.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.end(fs.readFileSync(path.join(__dirname, 'jsQR.js')));
  }
  if (req.method === 'POST' && req.url === '/api/vt') {
    const ip = req.socket.remoteAddress, now = Date.now();
    const list = (hits.get(ip) || []).filter(t => now - t < 60000);
    if (list.length >= 8) { res.statusCode = 429; return res.end(JSON.stringify({ error: 'Trop de requêtes, réessayez dans une minute.' })); }
    hits.set(ip, [...list, now]);
    let body = ''; req.on('data', c => { body += c; if (body.length > 5000) req.destroy(); });
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        if (!KEY) throw new Error('Clé VT_API_KEY absente sur le serveur.');
        const { url } = JSON.parse(body);
        const u = new URL(url);
        if (!/^https?:$/.test(u.protocol)) throw new Error('Protocole non pris en charge.');
        res.end(JSON.stringify(await analyse(u.href)));
      } catch (e) { res.statusCode = 502; res.end(JSON.stringify({ error: e.message })); }
    });
    return;
  }
  res.statusCode = 404; res.end('Introuvable');
};
(TLS ? https.createServer(TLS, handler) : http.createServer(handler))
  .listen(PORT, () => console.log('LienClair → ' + (TLS ? 'https' : 'http') + '://localhost:' + PORT));
