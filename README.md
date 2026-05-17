# OnlyLocals
OnlyLocals è un applicazione per mettere in contatto commercianti itineranti e clienti. Ogni commerciante può pubblicizzare la sua attività con una vetrina, che contiene informazioni riguardo all'itinerario del commerciante e eventuali promozioni o eventi promossi. Ogni utente può cercare diverse attività commerciali, inserirle tra i preferiti e fidelizzarsi con un sistema a punti.

# Struttura della Repository
La repository contiene due sezioni principali `backend` e `frontend`. Nella sezione `backend` è strutturato il server API della web app. Nella sezione `frontend` è presente il progetto expo (framweork basato su react native js) per l'interfaccia dell'applicazione.

```bash
.
├── backend
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── src
│   │   ├── app.js
│   │   ├── controllers
│   │   │   ├── shopController.js
│   │   │   └── userController.js
│   │   ├── middlewares
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models
│   │   │   ├── fidelityCardModel.js
│   │   │   ├── shopModel.js
│   │   │   └── userModel.js
│   │   ├── routes
│   │   │   ├── routesShop.js
│   │   │   └── routesUser.js
│   │   ├── server.js
│   │   └── services
│   │       ├── shopService.js
│   │       └── userService.js
│   └── utils
├── frontend
│   └── onlylocals-app
│       ├── app
│       │   ├── (auth)
│       │   ├── (customer)
│       │   ├── _layout.tsx
│       │   ├── shop.tsx
│       │   └── (vendor)
│       ├── app.json
│       ├── assets
│       │   └── images
│       ├── components
│       │   ├── FilterBar.tsx
│       │   ├── loginForm.tsx
│       │   ├── SearchBar.tsx
│       │   ├── ShopResultsList.tsx
│       │   ├── shopResult.tsx
│       │   └── shopSearchForm.tsx
│       ├── constants
│       ├── context
│       │   └── AuthContext.tsx
│       ├── eas.json
│       ├── eslint.config.js
│       ├── expo-env.d.ts
│       ├── package.json
│       ├── package-lock.json
│       ├── README.md
│       ├── services
│       │   ├── api.ts
│       │   ├── auth
│       │   ├── searchService.ts
│       │   ├── shopServices.ts
│       │   └── userServices.ts
│       ├── tsconfig.json
│       ├── types
│       │   ├── auth.ts
│       │   ├── shop.ts
│       │   └── user.ts
│       └── utils
│           └── getCurrentSlot.ts
├── LICENSE
└── README.md
```

# Utilizzo
## Backend
Entrare in `./backend`:
- installare i pacchetti necessari con `npm install`
- avviare il server in locale con `npm run start`
- il server può anche essere avviato in modalità development (con log dettagliati in caso di errori) con `npm run dev`
- con `npm run lint` viene avviato il tool di analisi statica del codice eslint

## Frontend
Entrare in `./frontend/onlylocals-app`:
- installare i pacchetti necessari con `npm install`
- per avviare il server di development usare `npx expo start`
- per utilizzare un dispositivo mobile fisico è necessario compilare con expo i file sorgenti contenenti anche la chiave di licenza mapbox
