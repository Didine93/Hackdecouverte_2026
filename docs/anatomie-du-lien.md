# Anatomie du lien

Une fonctionnalité de plus pour [QR Guard](inspecteur-qr.md) : afficher le lien scanné découpé en parties colorées, pour que l'utilisateur voie quelle partie désigne le vrai propriétaire du site et lesquelles ne sont que de la décoration.

## Ce que l'utilisateur voit

Pour `https://desjardins.com.connexion-securise.co/accesd`, l'écran de résultat affiche :

| Partie | Affichage | Étiquette |
|---|---|---|
| `desjardins.com.` | Grisé | « Décoration : le propriétaire peut écrire ce qu'il veut ici » |
| `connexion-securise.co` | Gras et rouge | « Le vrai propriétaire du site » |
| `/accesd` | Grisé | « Page à l'intérieur du site » |

Pour le `pаypal.com` cyrillique, on met en évidence la seule lettre étrangère avec la mention « cette lettre vient de l'alphabet cyrillique ».

Quand le verdict est vert, le domaine enregistré s'affiche en gras et en vert plutôt qu'en rouge.

## Pourquoi l'ajouter

- **Elle enseigne en plus d'avertir.** Un verdict dit à l'utilisateur quoi penser cette fois-ci ; l'anatomie lui montre comment lire n'importe quel lien lui-même. Ça donne à notre présentation un deuxième message, au-delà de « on bloque les fraudes ».
- **Elle rend la démo visuelle.** Le juge voit d'un coup d'œil pourquoi le lien est faux, sans lire une liste de constats.
- **Elle coûte peu.** La [vérification du domaine](verification-domaine.md) découpe déjà le nom d'hôte en sous-domaine, domaine enregistré et chemin. Cette fonctionnalité ne fait qu'afficher ces morceaux avec des couleurs différentes : c'est surtout du HTML et du CSS.
- **Elle ne demande ni serveur ni réseau**, donc elle ne peut pas échouer pendant la démo.
- **Elle aide pour le prix du meilleur design web**, puisque c'est l'élément le plus distinctif de l'écran de résultat.

## Comment la construire

1. La vérification du domaine fournit trois morceaux du lien : le sous-domaine, le domaine enregistré et le chemin.
2. La page place chaque morceau dans son propre élément `<span>`, avec une classe CSS différente (`decoration`, `proprietaire`, `chemin`).
3. Le CSS donne à chaque classe sa couleur, et une courte étiquette s'affiche sous chaque morceau.
4. Pour les lettres sosies, on parcourt le nom de domaine caractère par caractère et on entoure d'un `<span>` celles qui ne sont pas des lettres latines ordinaires.

Un piège : `new URL()` convertit un domaine cyrillique en sa forme `xn--`. Pour montrer la lettre étrangère, il faut partir du texte d'origine lu dans le code QR, pas du nom d'hôte converti.

## Qui peut la faire

La personne qui travaille sur le HTML et le CSS de la page peut construire l'affichage pendant que les vérifications se terminent : elle n'a besoin que des trois morceaux du lien.
