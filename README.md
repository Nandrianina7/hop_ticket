# Système de gestion d'évenement et cinema

Un plateforme de gestion d'évenement et cinema construite avec React.js, Django, Material-UI et MySql
qui permet aux organisateurs de créer, gérer et suivre des évenements et des emploi du temps du cinema
avec une capacité de planification de lieux.

## Compte utilisateur

Notre systeme contient 4 type d'utilisateur
  - Admin (web)
  - Organisateur des evenements (web)
  - Organisateur des cinema (web)
  - Utilisateur simple (mobile)

  1. Admin </br>
    Le compte admin peut tout faire les roles de l'organisateur. La création de compte admin est caché pour notre
    cas.</br> Pour créer un compte admin, il faut entrer directement le lien dans le bar de navigateur, comme par exemple
    http://localhost:5473/#/signup et remplir le formulaire present et puis creer le compte.

  2. Organisateur </br>
    Dans la page de connexion, il y a trois (3) boutons: connexion, en haut droite il y a 2 boutons pour creer le
    compte organisateur, et suivre simplement les processus d'inscription.

## Fonctionnalites

### Fonctionnalites principales

 - Gestion d'evenement et cinema: Creer, modifier, supprimer
 - Vente des tickets: Suivre les ventes de ticket
 - Achat des ticket: Voir le details de chaque ticket (status, client, code)

### Planification

  - Constructeur visuel de lieux d'evenement et la salle de cinema
  - Etiquettes en temps reel: ajouter des etiquettes textuelles aux zone et element
  - Integration base de donnees: Stockage persistant des dispositions de lieux

## Demarage rapide

### Prerequis

  - Node.js 18+
  - npm
  - Python 3+
  - pip
  - MySQL
  - environnement virtuel
  - Navigateur web
  - expo (app mobile recommander)

### Installation

1. Cloner le depot
  ```bash
      git clone git@github.com:Nandrianina7/ticket-Manager.git
      #ou
      git clone https://github.com/Nandrianina7/ticket-Manager.git
      cd ticket-Manager
  ```

2. Installer les dependances

  ```bash
      cd webadmin
      npm install
      cd ..
      cd frontend
      npm install
      cd ..
      cd Backend
      #activer vote environnement
      #sur linux ou MacOS
      source path/to/env/bin/activate
      #sur windows
      .\path/to/env\Scripts\activate.ps1
      pip install -r requirements.txt
  ```
3. Configurer les varibles d'environnement

Creer un fichier nommee .env dans chaque dossier (Backend, webadmin). </br>
  Dans le dossier ``Backend`` entrer dans le seconde dossier appeler Backend et creer le fichier **.env** et copie le code ci-dessous
  ```bash
      DB_ENGINE=mysql
      DB_NAME=ticket_manager
      DB_USER=root
      DB_PASSWORD=root
      DB_HOST=localhost
      DB_PORT=3306
  ```
  Dans le dossier ``webadmin``
  ```bash
      #remplacer l'adresse par une adresse correct de votre backend
      VITE_API_URL=http://localhost:8000
  ```
4. Demarrer les serveurs de developpement

  - **Backend** </br>
  Avant de demarrer le server backend il faut assurer que vous avez deja migrer dans votre base de donnees 
  et que le base de donnees ``ticket_manager`` existe deja

  ```bash
      #migrer
      python3 manage.py makemigrations
      python manage.py migrate
      #demarrer le service
      python manage.py runserver
  ```

  - **frontend** (mobile) </br>

  ```bash
      npm start
  ```

  - **webadmin**

  ```bash
      npm run dev
  ```

  L'application mobile s'ouvrira ave le port ``http://localhost:8081`` 
  dans le web et pour l'expo scanner le codeQR qui affiche dans votre terminal. </br>
  Et le webasmin s'ouvrira sur ``http://localhost:5173``


<u><b>Note:</b></u>(important)</br>
  Si vous preferer de lancer tout les services avec un caonnexion voici les etapes a suivre:

  1. Lancement du service backend
  ```bash
      python manage.py runserver 80.80.80.80:4090
  ```

  2. Lancement du service webadmin

  ```bash
      npm run dev -- --host
      #un adresse sur le connexion internet affiche 
      #ex: http://192.168.88.23:5173
  ```

  3. Lancer le service frontend

  ```bash
      npm start
      #exp se demarre et donne un adresse pour 
      #accceder notre application par une internet 
      #ex: exp://192.168.88.25:8081
  ```

  4. Configurations de quelaue ficher </br>
  - Backend/Backend/settings.py

  ```python
      ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.88.23', '192.168.88.25']

      CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:8081",
        "http://192.168.88.23:5173" #port du service webadmin
        "http://192.168.88.25:8081" #frontend service
      ]

      CORS_ALLOW_ALL_ORIGINS = True
      CORS_ALLOW_CREDENTIALS = True 


      CSRF_TRUSTED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:8081",
        "http://192.168.88.23:5173", #port du service webadmin
        "http://192.168.43.25:8081" #frontend service
      ]
  ```

  - webadmin/.env

  ```bash
      VITE_API_URL=http://80.80.80.80:4090 #backend service
  ```

  - frontend/utils/api.ts

  ```javascript
      import axios from 'axios';
      import AsyncStorage from '@react-native-async-storage/async-storage';

      const api = axios.create({
        baseURL: 'http://80.80.80.80:4090', /*backen service */
      });
      api.interceptors.request.use(async (config) => {
        const token = await AsyncStorage.getItem('access');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      api.interceptors.response.use(
        (res) => res,
        async (error) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refresh = await AsyncStorage.getItem('refresh');
            try {
              const response = await axios.post('http:80.80.80.80:4090/accounts/mobile/token/refresh/', {
                refresh: refresh,
              });

              const newAccess = response.data.access;
                await AsyncStorage.setItem('access', newAccess);
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

                return api(originalRequest);
            } catch (err) {
                await AsyncStorage.removeItem('access');
                await AsyncStorage.removeItem('refresh');
                return Promise.reject(err);
            }
          }

          return Promise.reject(error);
        }
      );

      export default api;

  ```

## Systeme basee auhtentification
## WEB
  Pour acceder a l'application, il faut d'abord etre s'authentifier, en identifiant par l'email et mot de passe.
  Le systeme verifie si l'utilisateur connecte est un organisateur d'evenement ou organisateur de cinema ou admin (superuser).</br>
  Les contenues afficher sont tous different pour les differents roles d'utilisateur. </br>

## Contenu web

### Organisateur cinema

1. <b>DASHBOARD:</b> 
  - Nombre total film ajouter et les session avenir
  - Nombre total de ticket vendu et les ticket vendu pour toutes les prochaines sessions 
  - Nombre total de room 
  - Tableau statistique qui montre les ticket vendu pour chaque session du dernier  7 jours
  2. <b>MOVIE:</b>  gestion de film et ses sessions
  3. <b>HALLS:</b>  gestion de salle
  4. <b>CONCESSION:</b>  gestion de snack present dans le cinema
  5. <b>CUSTOMERS:</b> visualisation des utilisateurs qui ont achete des tickets pour un session

### Organisateur evenement

1. <b>DASHBOARD:</b>
  - Total evenement creer par l'utilisateur connectee
  - Total d'utilisateur
  - Total de ticket vendu
  - Statistiques de ticket vendu pour chaque evenement
  - Action rapide: creer un evenement, creer un plan du cite
  - Affichage des evenement le plus vendu
2. <b>EVENTS:</b> gestion des evenements
3. <b>CUSTOMERS:</b> Affichage des ticket achete par les utilisateurs pour chaque evenement
4. <b>CITY PLAN:</b> gestion du plan de cite </br>
    Pour creer le plan du cite, il faut cliquer le bouton ``create new venue plan`` 
    en haut droite et des element de construction s'afficera. </br>Les elements sont: 
    <ul>
      <li><b>select</b> : pour selection un element creer</li>
      <li><b>rectangle et circle</b>: pour creer un plan rectangle et cercle</li>
      <li><b>line</b>: pour creer une ligne </li>
      <li><b>le form saisir de text</b>: Pour entrer le nom ou localisation du plan</li>
      <li>le boutons <b>Save Venue PLan</b>: pour enregistrer le plan creer </li>
    </ul>






  