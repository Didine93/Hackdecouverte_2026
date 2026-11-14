# Hackdecouverte_2026

**QR Guard** : une page web qui lit un code QR ou un lien et dit si l'adresse semble sûre avant de l'ouvrir.

## Lancer l'application

Il faut Node 18 ou plus récent. Aucune dépendance à installer.

```bash
# Linux / macOS
VT_API_KEY="votre_cle" node server.js
```

```powershell
# Windows (PowerShell)
$env:VT_API_KEY="votre_cle"; node server.js
```

Ouvrir ensuite <http://localhost:3000>. Sans clé VirusTotal, la vérification locale du domaine fonctionne quand même ; seule l'analyse VirusTotal est indisponible.

## Contenu du dépôt

- `index.html` : l'application QR Guard (interface, base de sites officiels, analyse locale du lien, lecture du code QR).
- `server.js` : le serveur qui sert la page et relaie les analyses vers VirusTotal, pour que la clé reste côté serveur.
- `jsQR.js` : la bibliothèque [jsQR](https://github.com/cozmo/jsQR) (licence Apache 2.0), incluse telle quelle pour lire les codes QR sans connexion à un CDN.
- `qr-guard/` : le logo et la police de QR Guard (`images/`, `fonts/`), ainsi que la première version de la page.
- [docs/inspecteur-qr.md](docs/inspecteur-qr.md) : le projet, l'ordre de construction et la démo.
- [docs/verification-domaine.md](docs/verification-domaine.md) : la vérification du domaine, la fonctionnalité principale.
- [docs/codes-qr-demo.md](docs/codes-qr-demo.md) : les codes QR à préparer pour la démo.
- [docs/camera-et-acces-mobile.md](docs/camera-et-acces-mobile.md) : la caméra, la lecture du code QR et l'accès depuis un téléphone.
- [docs/anatomie-du-lien.md](docs/anatomie-du-lien.md) : l'affichage du lien découpé en parties colorées.
