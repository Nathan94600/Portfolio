Vous pouvez accéder à mon portfolio en cliquant [ici](https://nathanmd.ovh)

# Configuration du site

1. Ouvrir un terminal
2. Cloner le site :

```
git clone https://github.com/Nathan94600/Portfolio.git
```

3. Aller dans le dossier du site
4. Installer les modules nécesessaires :

```
npm i
```

5. Créer un fichier `config.json` comme suit :

```json
{
	"senderEmail": "VOTRE EMAIL (par exemple celle associé à votre nom de domaine)",
	"password": "VOTRE MOT DE PASSE",
	"host": "URL POUR L'ENVOI DE MESSAGE (ex: ssl0.ovh.net pour OVH)",
	"port": PORT POUR L'ENVOI DE MESSAGE (ex: 465 chez OVH),
	"receiverEmail": "EMAIL OÙ VOUS VOULEZ RECEVOIR LES MAILS",
	"certPath": "CHEMIN VERS LE FICHIER DU CERTIFICAT" OU null POUR LANCER LE SERVEUR EN HTTP,
	"keyPath": "CHEMIN VERS LE FICHIER DE LA CLÉ PRIVÉE" OU null POUR LANCER LE SERVEUR EN HTTP,
	"salt": "SALT POUR CHIFFRER LES DONNÉES QUI SERONT SAUVEGARDÉES DANS LA DB",
	// Configuration pour la création du [Pool](https://node-postgres.com/apis/pool) pour PostgreSQL
	"pgConfig": {
		"host": "localhost",
		"password": "mdp_portfolio_user",
		"user": "portfolio_user",
		"database": "portfolio"
	} 
}
```

# Lancement et accès au site

1. Lancer le serveur web :

```
node server
```

2. Aller sur le lien affiché dans le terminal