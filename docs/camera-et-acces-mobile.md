# Caméra, lecture du code QR et accès mobile

Comment [QR Guard](inspecteur-qr.md) active la caméra et lit un code QR, et comment ouvrir l'application sur un téléphone pour la démo.

## Lire un code QR avec la caméra

Le plus simple est la bibliothèque `html5-qrcode` : elle gère la permission de la caméra, l'aperçu vidéo et le décodage, et nous remet le texte décodé dans une fonction de rappel.

### Ce qui se passe pendant un scan

C'est la partie à savoir expliquer aux juges :

1. **Permission :** la page demande la caméra au navigateur, et le navigateur demande à l'utilisateur.
2. **Flux vidéo :** une fois la permission accordée, l'image de la caméra s'affiche dans un élément `<video>` de la page.
3. **Captures d'images :** plusieurs fois par seconde, l'image vidéo du moment est copiée.
4. **Décodage :** la bibliothèque cherche les trois carrés des coins d'un code QR dans cette image, lit la grille de cases noires et blanches, et corrige les erreurs.
5. **Résultat :** elle remet à notre code le texte que contient le code QR, en général un lien.

Les étapes 1 et 2 sont la fonction `getUserMedia` intégrée au navigateur. Les étapes 3 à 5 sont le travail de la bibliothèque.

### Dans notre page

Dans le HTML, ajouter une boîte vide où l'aperçu de la caméra apparaîtra, et charger la bibliothèque avant `script.js` :

```html
<div id="reader"></div>
<script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
```

Dans `script.js`, le bouton démarre le lecteur :

```js
const scanner = new Html5Qrcode("reader");

button.addEventListener("click", async function () {
    try {
        await scanner.start(
            { facingMode: "environment" },   // caméra arrière sur un téléphone
            { fps: 10, qrbox: 250 },         // 10 essais par seconde, carré cible de 250 px
            async function (text) {          // s'exécute quand un code est lu
                await scanner.stop();        // éteindre la caméra
                analyser(text);              // notre vérification du domaine
            }
        );
    } catch (err) {
        result.textContent = "Impossible d'accéder à la caméra.";
    }
});
```

`analyser` représente notre fonction de vérification du domaine, quel que soit son nom. Cet exemple n'a pas été testé avec notre page : c'est un point de départ.

### Pièges à éviter

- **Tous les codes QR ne contiennent pas un lien.** Certains contiennent du texte, des réglages Wi-Fi ou une fiche de contact. Entourer `new URL(text)` d'un `try`/`catch` et afficher « Ce code ne contient pas de lien » en cas d'échec.
- **Arrêter la caméra après une lecture réussie.** Sinon la fonction de rappel se répète pour le même code et le témoin de la caméra reste allumé.
- **Gérer le refus de permission.** Si l'utilisateur choisit « Bloquer », afficher un message et garder le champ « coller un lien » comme autre entrée.
- **Garder le champ « coller un lien ».** C'est notre solution de secours si la caméra échoue pendant la démo.
- **Ne pas dépendre du CDN.** Copier le fichier de la bibliothèque dans `qr-guard/` (ou l'installer avec npm) pour que la démo fonctionne même si ce site est lent.

## Ouvrir l'application sur un téléphone

La caméra ne fonctionne que sur une page sécurisée (HTTPS). Avec notre serveur Node sur le portable :

- **Sur le portable, à `localhost` :** ça fonctionne, avec la webcam du portable.
- **Sur un téléphone qui vise l'adresse du portable :** refusé, parce que c'est du HTTP simple.

GitHub Pages ne règle pas ce problème, puisqu'il ne peut pas exécuter le serveur Node.

### Avec Tailscale

Tailscale peut donner une vraie adresse HTTPS au serveur Node. Il faut utiliser sa fonction HTTPS : l'adresse Tailscale ordinaire ne suffit pas.

| Adresse | Caméra | Qui peut l'ouvrir |
|---|---|---|
| `http://100.x.y.z:3000` (adresse Tailscale simple) | Refusée : c'est encore du HTTP | Nos appareils |
| `tailscale serve` → `https://<machine>.<tailnet>.ts.net` | Fonctionne | Seulement les appareils de notre réseau Tailscale |
| `tailscale funnel` → même adresse | Fonctionne | Tout le monde, donc aussi le téléphone d'un juge |

Mise en place :

1. Dans la console d'administration Tailscale, section **DNS**, activer **HTTPS Certificates** (et MagicDNS si ce n'est pas déjà fait).
2. Démarrer le serveur Node sur le port 3000.
3. Lancer `tailscale serve 3000`. La première fois, la commande affiche un lien pour approuver ce qui manque.
4. Sur le téléphone, avec Tailscale activé, ouvrir l'adresse `https://<machine>.<tailnet>.ts.net` affichée par la commande.

Pour les téléphones des juges, remplacer l'étape 3 par `tailscale funnel 3000`. Elle demande aussi une approbation la première fois.

À savoir :

- **Le premier chargement est lent.** Le certificat est émis à la première utilisation, ce qui prend plusieurs secondes. Ouvrir la page une fois avant la démo.
- **Le nom de la machine devient public.** Les certificats sont inscrits dans des registres publics. C'est sans danger ici, mais il faut le savoir.
- **Funnel expose le serveur du portable sur Internet.** Ne le lancer que pendant la démo, et l'arrêter ensuite avec `tailscale funnel reset`.
- **Ça dépend quand même du Wi-Fi de l'endroit.** Tester sur place.

### Solution de secours

Faire la démo sur le portable à `localhost`, avec la webcam, en scannant des codes affichés sur un téléphone (voir [codes-qr-demo.md](codes-qr-demo.md)). Ça ne demande rien de plus et ne dépend pas du réseau.

On construit et on teste d'abord avec la webcam du portable, puis on essaie Tailscale une fois que ça fonctionne.
