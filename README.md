# OnlyLocals

OnlyLocals è un applicazione per mettere in contatto commercianti itineranti e clienti. Ogni commerciante può pubblicizzare la sua attività con una vetrina, che contiene informazioni riguardo all'itinerario del commerciante e eventuali promozioni o eventi promossi. Ogni utente può cercare diverse attività commerciali, inserirle tra i preferiti e fidelizzarsi con un sistema a punti.

---

## Versioni

| Componente | Versione |
|---|---|
| Backend (Node.js / Express) | 1.0.0 |
| Frontend (Expo / React Native) | 1.0.0 |
| Node.js (richiesto) | ≥ 18.x |
| Expo SDK | ~54.0.33 |
| React Native | 0.81.5 |
| TypeScript | ~5.9.2 |
| MongoDB driver (Mongoose) | ^9.6.0 |

---

## Struttura della Repository

```
.
├── backend
│   ├── eslint.config.js
│   ├── package.json
│   ├── only-locals-backend-test       # gruppo di test con Jest
│   │   ├── package.json
│   │   ├── shops.test.js
│   │   └── users.test.js
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── controllers
│       │   ├── feedbackController.js
│       │   ├── shopController.js
│       │   └── userController.js
│       ├── middlewares
│       │   ├── authMiddleware.js
│       │   └── errorMiddleware.js
│       ├── models
│       │   ├── feedbackModel.js
│       │   ├── fidelityCardModel.js
│       │   ├── shopModel.js
│       │   └── userModel.js
│       ├── routes
│       │   ├── routesFeedback.js
│       │   ├── routesShop.js
│       │   └── routesUser.js
│       └── services
│           ├── emailService.js
│           ├── feedbackService.js
│           ├── notificationService.js
│           ├── shopService.js
│           └── userService.js
├── frontend
│   └── onlylocals-app
│       ├── app.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── app
│       │   ├── _layout.tsx
│       │   ├── (auth)              # login, registrazione, recupero password
│       │   ├── (customer)          # home, preferiti, fidelity card, notifiche, profilo
│       │   └── (vendor)            # dashboard, itinerario, statistiche, fidelity, feedback
│       ├── components
│       ├── context
│       │   └── AuthContext.tsx
│       ├── services               # chiamate REST al backend
│       ├── types
│       └── utils
└── README.md
```

---

## Prerequisiti

- **Node.js** ≥ 18.x e **npm**
- **MongoDB Atlas** (o istanza locale) — la stringa di connessione va in `.env`
- **Expo CLI** (`npm install -g expo-cli`) per lo sviluppo frontend
- **Account Brevo** per l'invio di e-mail transazionali
- Per build su dispositivo fisico: account **Expo EAS** e token **Mapbox** (necessario per compilare la libreria `@rnmapbox/maps`)

---

## Configurazione dell'ambiente

### Backend — file `.env`

Creare il file `backend/.env` partendo dall'esempio seguente:

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/onlylocals
JWT_TOKEN=<chiave_segreta_jwt>
REFRESH_TOKEN_KEY=<chiave_segreta_refresh>
BREVO_API_KEY=<api_key_brevo>
BREVO_SENDER_EMAIL=<email_mittente>
```

### Frontend

Il frontend si connette al backend tramite l'URL definito in `frontend/onlylocals-app/services/api.ts`. Modificare l'indirizzo IP/hostname per puntare all'istanza del server in uso (locale o remota).

---

## Utilizzo

### Backend

```bash
cd backend
npm install          # installa le dipendenze
npm run start        # avvia il server (porta definita in .env, default 3000)
npm run dev          # avvia con nodemon (riavvio automatico + log dettagliati)
npm run lint         # analisi statica con ESLint
```

La documentazione interattiva Swagger UI è disponibile all'indirizzo `http://localhost:3000/api-docs` quando il server è in esecuzione, o disponibile sempre all'indirizzo `https://onlylocals.onrender.com/api-docs/#/`


### Frontend

```bash
cd frontend/onlylocals-app
npm install                 # installa le dipendenze
npx expo start              # avvia il server Metro (scansionare QR con Expo Go)
npx expo start --android    # apre direttamente su emulatore Android
npx expo start --ios        # apre direttamente su simulatore iOS
npm run lint                # analisi statica con ESLint
```

Per utilizzare l'app su un **dispositivo fisico** con le mappe Mapbox è necessario effettuare una build nativa tramite EAS:

```bash
npx eas build --platform android --profile preview
```
Prima di lanciare la compilazione della build è necessario inserire in `app.json`, nel campo `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` il proprio token privato mapbox.

In alternativa è disponibile l'APK precompilato `onlylocals.apk` al link: `https://drive.google.com/file/d/1u5vt-xEglyJ2fIuMlAlQX2-3XtLEWz6m/view?usp=sharing`.

---

## Test

I test di integrazione del backend si trovano in `backend/only-locals-backend-test/` e usano **Jest** + **Supertest**. I servizi e i modelli Mongoose sono integrati nel test, quindi i test non richiedono una connessione al database.

```bash
cd backend/only-locals-backend-test
npm install
npm test                # esegue tutti i test
npm run test:watch      # modalità watch (riesecuzione ad ogni modifica)
npm run test:coverage   # esecuzione con report di copertura
```

### Copertura attuale

| File di test | Endpoint coperti |
|---|---|
| `users.test.js` | register, login, logout, refreshToken, me, favorites, fidelity/points, profile, pushToken, notifications, searches, forgot-password, verify-pin, reset-password |
| `shops.test.js` | register, search, stats, get by id, promotion (add/delete), event (add/delete), fidelity scan, fidelity vantaggi, addPoints, redeem, modifyConversion, feedback, update |

I test verificano i codici di stato HTTP attesi e la struttura del body di risposta per ogni caso d'uso principale.