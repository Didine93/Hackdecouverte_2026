# Inspecteur de codes QR et de liens

Proposition de projet pour HackDécouverte II : ce que fait l'application, comment elle est construite, quoi couper selon notre équipe, et comment la présenter.

## L'idée en une phrase

Un code QR est un lien qu'on ne peut pas lire. L'application le lit à notre place, visite la destination pour nous, et dit en langage clair si elle semble sûre, avant même que le téléphone l'ouvre.

## Ce que voit l'utilisateur

1. Il ouvre la page web et pointe la caméra vers un code QR (ou colle un lien).
2. L'application affiche le lien décodé sans l'ouvrir.
3. Quelques secondes plus tard, un rapport apparaît : un verdict vert, jaune ou rouge, le chemin que suit le lien, et une courte liste de constats comme « ce domaine a été enregistré il y a 4 jours ».
4. Un bouton propose « Ouvrir quand même » ou « Ne pas ouvrir ».

## Comment ça fonctionne

Il y a deux parties, et la séparation est importante parce qu'un navigateur ne peut pas faire les vérifications lui-même.

- **Côté client (la page) :** une bibliothèque JavaScript de lecture de codes QR (`html5-qrcode` ou `jsQR`) décode l'image et envoie le lien à notre serveur.
- **Côté serveur (Python avec Flask) :** une route reçoit le lien, exécute les vérifications, et renvoie les résultats en JSON pour que la page les affiche.

## Les vérifications, de la plus facile à la plus difficile

| Vérification | Ce qu'elle détecte | Comment | Difficulté |
|---|---|---|---|
| Forme du lien | Pas de HTTPS, adresse IP brute au lieu d'un nom, liens très longs ou avec des caractères étranges, astuces avec `@` | Inspection de la chaîne avec `urllib.parse` de Python | Facile |
| Chaîne de redirections | Liens courts (bit.ly) qui cachent la vraie destination, nombreux sauts | `requests` avec redirections, lire `response.history` | Facile |
| Domaine sosie | `paypa1.com`, `desjardins-securite.co` | Comparer à une liste d'environ 30 marques connues avec la distance d'édition | Moyenne |
| Âge du domaine | Les sites frauduleux ont souvent quelques jours | Requête RDAP gratuite (`rdap.org`), sans clé | Moyenne |
| Certificat | À qui le certificat a été délivré et quand | Module `ssl` de Python | Moyenne |
| Contenu de la page | Un champ de mot de passe ou de numéro de carte sur la page finale | Récupérer le HTML et chercher `<input type="password">` | Moyenne |

Chaque constat ajoute des points à un score de risque, et le total détermine la couleur. Le calcul du score est notre propre logique, et c'est ce que les juges veulent nous voir expliquer.

## Quoi construire avec un seul codeur

**Version minimale (viser qu'elle fonctionne avant le dîner) :**
- Scanner ou coller un lien.
- Vérification de la forme du lien et chaîne de redirections.
- Verdict avec couleur et liste de constats.

**À ajouter dans cet ordre si le temps le permet :**
1. Vérification du domaine sosie.
2. Âge du domaine.
3. Détection d'un champ de mot de passe.
4. Un résumé en langage clair rédigé par Claude à partir de nos constats.
5. Détails du certificat.

La version minimale est à elle seule un projet complet et démontrable. Tout ce qui vient après rend le verdict plus intelligent sans changer la structure.

## Le travail des trois non-codeurs

- **Matériel de démo :** concevoir deux affiches, une légitime et une fausse (« iPad gratuit, scannez ici »), et construire la fausse page d'arrivée avec un formulaire de connexion. Du HTML simple suffit.
- **Liste de marques et règles de score :** choisir les marques connues et décider combien de points vaut chaque signe d'alerte, avec une raison pour chacun.
- **Textes :** rédiger l'explication en langage clair de chaque constat, en français et en anglais puisque l'événement est bilingue.
- **Présentation et Devpost :** l'histoire, les diapositives s'il y en a, la description, et la déclaration d'utilisation de l'IA.

Chacun devrait aussi s'asseoir avec le codeur pour une vérification, afin de pouvoir l'expliquer à un juge.

## Risques à prévoir

- **La caméra du téléphone exige HTTPS.** Les navigateurs n'autorisent l'accès à la caméra que sur une page sécurisée. Ça fonctionne sur le portable à `localhost`, mais un téléphone qui se connecte au portable sera refusé. Les solutions : un tunnel (`cloudflared` ou `ngrok`), un déploiement sur un hébergeur gratuit, ou simplement faire la démo avec la webcam du portable.
- **Le Wi-Fi du campus peut bloquer le trafic entre appareils**, ce qui est une raison de plus d'utiliser un tunnel ou la webcam du portable.
- **Ne pas tester sur de vrais sites d'hameçonnage.** Utiliser notre propre fausse page : c'est plus sûr et la démo est reproductible.
- **Notre serveur récupère des liens fournis par des inconnus.** Fixer un délai d'attente, limiter le nombre de redirections, et ne jamais exécuter les scripts de la page. Ça vaut la peine de le mentionner aux juges comme décision de conception.
- **Requêtes lentes.** L'âge du domaine peut prendre quelques secondes ; afficher d'abord les constats rapides.

## La démo

1. Raconter l'histoire : « Vous voyez cette affiche dans un couloir. Est-ce que vous la scanneriez ? »
2. Scanner l'affiche légitime : vert.
3. Faire scanner la fausse par un juge : rouge, avec les raisons affichées.
4. Ouvrir le code et parcourir une vérification et le calcul du score.

## Horaire approximatif

| Heure | Codeur | Les autres |
|---|---|---|
| 9 h 30 – 10 h 30 | Squelette Flask, page avec « coller un lien » | Ateliers, puis affiches et liste de marques |
| 10 h 30 – 12 h | Chaîne de redirections, forme du lien, affichage du verdict | Fausse page d'arrivée, textes des constats |
| 13 h – 15 h | Lecture de codes QR, domaine sosie, âge du domaine | Salon de l'emploi à tour de rôle, brouillon Devpost |
| 15 h – 16 h | Finition, tunnel ou webcam, tester les deux affiches | Répéter la présentation |
| 16 h – 16 h 30 | Gel du code, soumission | Soumission Devpost |

Avoir un seul codeur est la contrainte principale : si la version minimale ne fonctionne pas à 13 h, on laisse tomber la caméra et on fait la démo avec des liens collés.

## Rappels du règlement

- Tout le travail doit être fait pendant l'événement : on peut planifier maintenant, mais pas écrire de code à l'avance.
- Les générateurs d'applications en une requête (Lovable, Base44, Manus, Replit Agent) sont interdits. Les assistants comme Claude Code sont permis, à condition que chaque membre puisse expliquer le code et qu'on remplisse la déclaration d'utilisation de l'IA.
