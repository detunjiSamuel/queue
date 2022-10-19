# Queue API

> Queue API for the queue Application which is a savings platform for fait & cryptocurrency

## Usage

Rename ".env.example" to ".env" and update the values/settings to your own

## Install Dependencies

Run

```
npm i
```

or

```
npm install
```

## Run Application

```
# Run in dev mode
npm run start:dev

# Run in production mode
npm run start
```
## Folder Strucure

```
📦 queue
├─ .env.example
├─ .eslintignore
├─ .eslintrc.json
├─ .gitignore
├─ .prettierrc.json
├─ .vscode
│  └─ settings.json
├─ Procfile
├─ jest.config.js
├─ mocks
│  └─ index.ts
├─ nodemon.json
├─ package.json
├─ readme.md
├─ seed
│  ├─ data
│  │  ├─ Card.json
│  │  ├─ CoinRequest.json
│  │  ├─ EmailVerification.json
│  │  ├─ Savings.json
│  │  ├─ Transaction.json
│  │  └─ User.json
│  ├─ extractor.ts
│  └─ seeder.ts
├─ src
│  ├─ Processors
│  │  ├─ email.ts
│  │  ├─ flw_webhook.ts
│  │  └─ paymentCharge.ts
│  ├─ app.ts
│  ├─ config
│  │  ├─ bull.ts
│  │  ├─ database.ts
│  │  ├─ index.ts
│  │  └─ redis.ts
│  ├─ controllers
│  │  ├─ auth.controller.ts
│  │  ├─ card.controller.ts
│  │  ├─ coin.controller.ts
│  │  ├─ savings.controller.ts
│  │  ├─ trasactions.controller.ts
│  │  └─ webhook.controller.ts
│  ├─ index.ts
│  ├─ jobs
│  │  └─ index.ts
│  ├─ middleware
│  │  ├─ error.ts
│  │  └─ index.ts
│  ├─ models
│  │  ├─ card.model.ts
│  │  ├─ coinRequest.model.ts
│  │  ├─ emailVerification.model.ts
│  │  ├─ savings.model.ts
│  │  ├─ transaction.model.ts
│  │  └─ user.model.ts
│  ├─ routes
│  │  ├─ auth.ts
│  │  ├─ card.ts
│  │  ├─ email.ts
│  │  ├─ index.ts
│  │  ├─ misc.ts
│  │  ├─ savings.ts
│  │  └─ transaction.ts
│  ├─ services
│  │  ├─ auth.service.ts
│  │  ├─ binance.service.ts
│  │  ├─ card.service.ts
│  │  ├─ email.service.ts
│  │  ├─ flutterwave.service.ts
│  │  ├─ savings.service.ts
│  │  └─ webhook.service.ts
│  ├─ utils
│  │  ├─ error.ts
│  │  └─ index.ts
│  └─ validator
│     ├─ auth.validator.ts
│     ├─ card.validator.ts
│     ├─ index.ts
│     └─ savings.validator.ts
├─ test
│  └─ binance.test.ts
└─ tsconfig.json
```


### Version: 1.0.4

### License: MIT

