# QR Guard : inspecteur de codes QR et de liens

Document de projet pour HackDécouverte II : ce qu'on construit, dans quel ordre, et comment on le présente.

## L'idée en une phrase

Un code QR est un lien qu'on ne peut pas lire. QR Guard le lit à notre place et dit en langage clair si l'adresse semble sûre, avant même que le téléphone l'ouvre.

## Ce qu'on construit en priorité : la vérification du domaine

**Le cœur du projet est la vérification du domaine.** C'est la fonctionnalité qu'on termine en premier, qu'on montre dans la démo et qu'on explique aux juges. Tout le reste vient après, seulement si elle fonctionne bien.

Elle prend le lien décodé, en extrait le nom de domaine, et pose trois questions :

1. **Est-ce qu'il imite une marque connue ?** (`paypa1.com`, `desjardins-securite.co`)
2. **Est-ce qu'il contient des caractères suspects ?** (lettres d'un autre alphabet, adresse IP brute, suffixe douteux)
3. **Quel âge a-t-il ?** (un domaine créé il y a 4 jours est un signe d'alerte)

Chaque constat ajoute des points à un score de risque, et le total donne un verdict vert, jaune ou rouge. Le fonctionnement complet, la grille de points et les limites sont dans [verification-domaine.md](verification-domaine.md).

### Pourquoi celle-là

- **Elle attrape le cas le plus courant :** une fausse adresse qui ressemble à une vraie.
- **Elle peut tourner entièrement dans le navigateur**, dans `qr-guard/script.js`, sans serveur. On garde donc la page déjà commencée et on n'a rien à héberger.
- **Elle est rapide :** les vérifications 1 et 2 sont instantanées, donc la démo ne dépend pas du réseau.
- **Elle s'explique bien :** la distance d'édition et le calcul du score sont notre propre logique, ce que les juges veulent nous voir expliquer.

## Ce que voit l'utilisateur

1. Il ouvre la page et pointe la caméra vers un code QR (ou colle un lien).
2. La page affiche le lien décodé sans l'ouvrir.
3. Le rapport apparaît : un verdict vert, jaune ou rouge, et une courte liste de constats comme « cette adresse utilise le nom Desjardins mais n'appartient pas à Desjardins ».
4. Un bouton propose « Ouvrir quand même » ou « Ne pas ouvrir ».

## Ordre de construction

**Version minimale (à terminer avant tout le reste) :**
1. Un champ pour coller un lien, et l'affichage du verdict avec la liste de constats.
2. Vérification du domaine, partie instantanée : nom de marque dans un autre domaine, caractères sosies (`xn--`), adresse IP brute, suffixe inhabituel.
3. Distance d'édition par rapport à la liste de marques.
4. Lecture d'un code QR avec la caméra (bibliothèque `html5-qrcode` ou `jsQR`).

Cette version est à elle seule un projet complet et démontrable.

**Ensuite, dans cet ordre, si le temps le permet :**
1. Âge du domaine (requête RDAP).
2. Forme du lien : pas de HTTPS, lien très long, astuces avec `@`.
3. Un résumé en langage clair rédigé par Claude à partir de nos constats.

**Seulement avec un serveur (Python avec Flask), donc en dernier :**
- Chaîne de redirections, pour voir la vraie destination derrière un lien court (bit.ly).
- Détails du certificat.
- Détection d'un champ de mot de passe sur la page finale.

Sans serveur, un lien court est analysé tel quel : on vérifie `bit.ly`, pas sa destination. Dans ce cas, la page doit l'indiquer (« lien raccourci : destination inconnue ») et donner jaune.

## Répartition du travail

- **Code :** `script.js` (extraction du domaine, vérifications, score), puis la caméra.
- **Liste de marques et règles de score :** choisir les marques connues et décider combien de points vaut chaque signe d'alerte, avec une raison pour chacun.
- **Textes :** rédiger l'explication en langage clair de chaque constat, en français et en anglais puisque l'événement est bilingue.
- **Matériel de démo :** deux affiches avec code QR, une légitime et une fausse (« iPad gratuit, scannez ici ») qui pointe vers un domaine sosie.
- **Présentation et Devpost :** l'histoire, la description, et la déclaration d'utilisation de l'IA.

Chaque membre devrait pouvoir expliquer au moins une vérification à un juge.

## Risques à prévoir

- **La caméra du téléphone exige HTTPS.** Les navigateurs n'autorisent l'accès à la caméra que sur une page sécurisée. Ça fonctionne sur le portable à `localhost`. Pour un téléphone, il faut héberger la page (GitHub Pages suffit puisqu'il n'y a pas de serveur) ou faire la démo avec la webcam du portable.
- **Ne pas tester sur de vrais sites d'hameçonnage.** Le code QR de la fausse affiche contient un domaine sosie inventé ; comme QR Guard n'ouvre jamais le lien, le site n'a pas besoin d'exister.
- **L'âge du domaine dépend d'un service externe.** La requête peut être lente, échouer, ou être bloquée par le navigateur. Afficher d'abord les constats instantanés, et « âge inconnu » si elle ne répond pas.
- **Si la caméra ne fonctionne pas à temps,** on fait la démo avec des liens collés.

## La démo

1. Raconter l'histoire : « Vous voyez cette affiche dans un couloir. Est-ce que vous la scanneriez ? »
2. Scanner l'affiche légitime : vert.
3. Faire scanner la fausse par un juge : rouge, avec les raisons affichées.
4. Ouvrir `script.js` et parcourir la vérification du domaine et le calcul du score.

## Rappels du règlement

- Tout le travail doit être fait pendant l'événement.
- Les générateurs d'applications en une requête (Lovable, Base44, Manus, Replit Agent) sont interdits. Les assistants comme Claude Code sont permis, à condition que chaque membre puisse expliquer le code et qu'on remplisse la déclaration d'utilisation de l'IA.
- Mentionner dans la soumission les bibliothèques et services utilisés (lecture de codes QR, RDAP).
