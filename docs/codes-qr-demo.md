# Codes QR pour la démo

Comment montrer un code QR malveillant aux juges avec [QR Guard](inspecteur-qr.md).

On fabrique des codes QR qui contiennent des liens inventés, du genre de ceux qu'utilisent les fraudeurs, chacun construit pour déclencher une de nos vérifications. Comme QR Guard n'ouvre jamais le lien, les sites n'ont pas besoin d'exister.

## Les codes à préparer

| Le code QR contient | Ce qu'il montre | Verdict attendu |
|---|---|---|
| `https://www.desjardins.com` | Le vrai site, pour comparer | Vert |
| `https://desjardins.com.connexion-securise.co/accesd` | Un nom de marque placé devant le domaine de quelqu'un d'autre | Rouge |
| `https://www.paypa1.com/login` | Un caractère changé (`1` à la place de `l`) | Rouge |
| `https://www.pаypal.com` écrit avec un « а » cyrillique | Identique à l'œil, mais c'est un autre domaine | Rouge |
| `http://203.0.113.5/login` | Un numéro à la place d'un nom de site, et pas de HTTPS | Rouge ou jaune |
| `https://bit.ly/3xAmPle` | Un lien court qui cache sa destination | Jaune |

L'adresse `203.0.113.5` fait partie d'une plage réservée à la documentation : elle n'appartient à personne.

## Lesquels montrer aux juges

On n'a que quelques minutes, donc on en choisit trois :

1. **Le vrai lien Desjardins** donne vert, ce qui prouve que l'application ne crie pas au loup.
2. **Le lien `desjardins.com.connexion-securise.co`** donne rouge ; c'est la fraude la plus réaliste.
3. **Le `pаypal.com` cyrillique** est le moment le plus fort : montrer le lien au juge, lui demander s'il voit un problème, puis le scanner. Aucun humain ne peut le repérer, notre application oui.

Garder les autres dans l'album au cas où un juge demande « et si… ».

## Donner une histoire à chaque code

Un code QR seul convainc moins qu'un code mis en contexte. Placer chacun sur une image simple, par exemple :

- Un autocollant de parcomètre : « Payez votre stationnement ici ».
- Un texto : « Votre colis est en attente, confirmez votre adresse ».
- Une affiche : « iPad gratuit pour les étudiants ».

## Afficher les codes sans imprimante

On n'a pas d'imprimante, donc on affiche les codes sur l'écran d'un autre téléphone ou du portable. Les caméras lisent très bien un code QR sur un écran.

- **Générer des codes statiques, pas « dynamiques ».** Beaucoup de générateurs gratuits encodent un lien court de leur propre domaine qui redirige vers le nôtre. QR Guard vérifierait alors le domaine du générateur au lieu de notre faux domaine.
- **Noir sur blanc, avec une marge blanche autour du code.** Les codes inversés (blanc sur noir, comme en mode sombre) échouent avec certains lecteurs.
- **Monter la luminosité et désactiver le verrouillage automatique** du téléphone qui affiche, pour que l'écran ne s'éteigne pas en pleine démo.
- **Enregistrer les codes comme images dans un seul album**, le légitime en premier, pour passer de l'un à l'autre d'un glissement de doigt.
- **Afficher le code en grand** et tenir les téléphones à 15–20 cm l'un de l'autre, en inclinant un peu s'il y a des reflets.

Pour la présentation, l'écran de téléphone sert même l'histoire : les faux codes QR arrivent aussi par texto et par courriel, pas seulement sur des affiches.

## À vérifier avant la démo

- **Tester chaque code avec l'application** et confirmer que le verdict et les raisons affichées sont ceux qu'on attend.
- **Ne pas appuyer sur « Ouvrir quand même » pour les faux liens.** Un domaine inventé comme `paypa1.com` est peut-être réellement enregistré par quelqu'un.
- **L'âge du domaine ne s'affichera pas pour les domaines inventés**, puisqu'ils ne sont pas enregistrés : l'application dira « âge inconnu ». Pour montrer cette vérification, scanner un vrai site créé récemment, ou la laisser hors de la démo en direct.
