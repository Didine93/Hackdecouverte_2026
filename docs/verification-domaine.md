# Vérification du domaine

**C'est le cœur de [QR Guard](inspecteur-qr.md) : la fonctionnalité qu'on construit en premier.** Elle s'écrit en JavaScript dans `qr-guard/script.js` et tourne dans le navigateur, sans serveur.

La vérification prend le lien décodé, en extrait le nom de domaine, et pose trois questions : est-ce qu'il imite une marque connue, est-ce qu'il contient des caractères suspects, et quel âge a-t-il ?

## Étape 0 : extraire la bonne partie du lien

Dans `https://login.desjardins.com.secure-acces.co/compte`, la partie qui compte est le **domaine enregistré** : `secure-acces.co`. Tout ce qui est à sa gauche (`login.desjardins.com.`) est un sous-domaine que le propriétaire peut nommer comme il veut, et les fraudeurs s'en servent pour mettre un nom de confiance au début.

- En JavaScript, `new URL(lien).hostname` donne le nom d'hôte.
- Pour le domaine enregistré, on découpe le nom d'hôte sur les points et on garde les deux derniers morceaux (`secure-acces` + `co`).
- Exception : certains suffixes ont deux morceaux (`.qc.ca`, `.co.uk`, `.gouv.qc.ca`). On garde une courte liste de ces suffixes et, quand le nom d'hôte se termine par l'un d'eux, on garde un morceau de plus.

## Vérification 1 : est-ce qu'il imite une marque connue ?

On garde une liste d'environ 30 vrais domaines (`desjardins.com`, `paypal.com`, `omnivox.ca`, `canadapost.ca`, `netflix.com`…) et on compare le domaine scanné à chacun. Il y a trois cas :

- **Correspondance exacte :** le domaine est dans la liste, donc c'est le vrai. Le score de risque baisse.
- **Correspondance proche :** le nom est à une ou deux lettres d'une marque, comme `paypa1.com` ou `desjadins.com`. On le mesure avec la **distance d'édition** (Levenshtein) : le nombre de lettres à ajouter, enlever ou remplacer pour passer d'un mot à l'autre. `paypa1` → `paypal` demande 1 remplacement, donc la distance est 1. Une distance de 1 ou 2 sans correspondance exacte est un signe d'alerte fort.
- **Nom de marque utilisé dans un autre domaine :** `desjardins-securite.co` ou `desjardins.com.secure-acces.co`. On vérifie simplement si un nom de marque apparaît quelque part dans le nom d'hôte complet alors que le domaine enregistré n'est pas celui de la marque. Ce cas attrape plus de vraies fraudes que la distance d'édition.

La distance d'édition tient en une quinzaine de lignes de JavaScript. L'écrire nous-mêmes en fait un bon morceau à expliquer aux juges.

## Vérification 2 : caractères suspects

- **Lettres sosies d'autres alphabets :** `раypal.com` écrit avec un « а » cyrillique est identique à l'écran. À l'interne, ces domaines commencent par `xn--` (le punycode), donc la vérification est simplement : est-ce qu'une partie du nom d'hôte commence par `xn--` ?
- **Adresse IP brute** à la place d'un nom (`http://185.23.4.9/login`).
- **Beaucoup de traits d'union ou de chiffres**, ou un nom d'hôte très long.
- **Suffixes bon marché souvent utilisés pour les fraudes** (`.xyz`, `.top`, `.click`), à partir d'une courte liste qu'on choisit. C'est un signal faible, donc il vaut peu de points.

## Vérification 3 : quel âge a le domaine ?

Les domaines frauduleux sont en général enregistrés quelques jours avant d'être utilisés, alors que les vraies organisations ont le leur depuis des années.

- Envoyer une requête avec `fetch` à `https://rdap.org/domain/secure-acces.co`. RDAP est le remplaçant moderne de WHOIS, il est gratuit et ne demande pas de clé.
- La réponse JSON contient une liste `events` ; celui dont `eventAction` vaut `"registration"` donne la date de création.
- Soustraire de la date du jour : moins de 30 jours est un signe d'alerte fort, moins de 6 mois un signe léger.

Certains suffixes ne publient pas cette date, et la requête échoue parfois ou peut être bloquée par le navigateur (à tester tôt). Dans ce cas, afficher « âge inconnu » et n'ajouter aucun point : une réponse manquante n'est ni rassurante ni inquiétante.

## Transformer le tout en score

Chaque constat ajoute des points et vient avec une phrase pour l'utilisateur :

| Constat | Points | Message |
|---|---|---|
| Nom de marque dans un domaine qui n'appartient pas à la marque | +40 | « Cette adresse utilise le nom Desjardins mais n'appartient pas à Desjardins. » |
| À une ou deux lettres d'une marque | +40 | « Ça ressemble à paypal.com avec une lettre changée. » |
| Caractères sosies (`xn--`) | +30 | « Cette adresse utilise des lettres d'un autre alphabet qui imitent les lettres normales. » |
| Enregistré il y a moins de 30 jours | +30 | « Ce site a été créé il y a 4 jours. » |
| Adresse IP brute | +20 | « Ce lien pointe vers un numéro, pas vers un site nommé. » |
| Suffixe inhabituel | +10 | « Ce type d'adresse est souvent utilisé pour des fraudes. » |

Les valeurs des points sont à nous de décider et de défendre : c'est une bonne tâche pour les trois non-codeurs.

## Limites

- Un site légitime tout neuf sera signalé comme jeune ; c'est pourquoi l'âge seul doit donner jaune, pas rouge.
- Un domaine court peut ressembler à une marque par hasard (`appel.com` et `apple.com`), donc on n'applique la distance d'édition qu'aux noms de 5 lettres ou plus.
- La liste de marques ne couvre que ce qu'on y met. Il faut le dire pendant la présentation : les juges apprécieront qu'on connaisse cette limite.

## Ordre de construction

1. « Nom de marque dans un autre domaine » et la vérification `xn--` (quelques lignes chacune).
2. Distance d'édition.
3. Âge du domaine.
