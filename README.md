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
	"receiverEmail": "EMAIL OÙ VOUS VOULEZ RECEVOIR LES MAILS"
}
```

# Lancement et accès au site

1. Lancer le serveur web :

```
node server
```

2. Aller sur le lien affiché dans le terminal

# Todolist

- Faire le responsive de toutes les pages