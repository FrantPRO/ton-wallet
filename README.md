# TON Testnet Wallet

A self-custodial TON testnet wallet built with React and TypeScript. No backend required.

## Features

- Create or import a wallet using a 24-word mnemonic
- View wallet address and balance
- Transaction history with search
- Receive TON — address display, QR code, copy button
- Send TON — with address substitution protection and balance warnings

## Address Substitution Protection

Friction by design — user cannot proceed on autopilot:

1. **Paste confirmation modal** — after pasting an address, shows first/last 6 characters and requires explicit confirmation. Protects against clipboard hijacking.
2. **New address warning** — yellow flag if the address has never appeared in transaction history. Protects against copy-paste from chats or messages.
3. **Final confirmation screen** — shows full address and amount before sending, no automatic proceed. Applies to all scenarios.
4. **High balance warning** — warns if the user is about to send more than 90% of their balance. Requires clicking Continue twice to proceed.

## Tech Stack & Decision Log

**React** — familiar stack, rich ecosystem with crypto UI kits (e.g. @tonconnect/ui-react).

**useState navigation over React Router** — 4 screens don't justify the complexity of a full router.

**@ton/ton + @ton/crypto** — tonweb rejected as deprecated. As a backend developer: don't use unmaintained libraries. Official SDK, actively maintained.

**WalletV4 over V5** — V5 is newer but V4 is better documented. In an unfamiliar domain, good documentation matters more than new features.

**toncenter.com** — official TON Foundation API, native integration with TonClient. API key obtained via @tonapibot, stored in .env.

**localStorage** — task explicitly states production-grade security is not required. Mnemonic stored as-is, keys derived on every startup.

**TypeScript** — @ton/ton is written in TS, types come out of the box. Crypto code operates on Uint8Array, Buffer, Cell — type safety prevents errors at layer boundaries. As a Go developer, static typing is conceptually familiar.

## Architecture
```
src/
├── crypto/          # key generation, address derivation, transaction signing
├── network/         # TON API client, balance and transaction fetching
├── storage/         # localStorage read/write
├── screens/         # Setup, Dashboard, Send, Receive
│   ├── Setup/       # create or import wallet, mnemonic display
│   ├── Dashboard/   # balance, address, transaction history
│   ├── Send/        # send form with address protection
│   └── Receive/     # address display with QR code
└── App.tsx          # navigation state machine (setup | dashboard | send | receive)
```

Navigation is implemented as a simple `useState<Screen>` — no React Router needed for 4 screens.

Each screen has its own CSS module for isolated styling.

## Setup

1. Clone the repository and install dependencies:
```shell
npm install
```

2. Get a testnet API key from [@tonapibot](https://t.me/tonapibot) and create `.env` in the project root:
```
VITE_TONCENTER_API_KEY=your_key_here
```

3. Start the development server:
```shell
npm run dev
```

4. Open http://localhost:5173 in your browser

5. Get testnet TON from [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)

## Running Tests
```shell
npm run test
```

## Tradeoffs & Compromises

- **Mnemonic stored without encryption** — acceptable per task requirements, not production-grade
- **WalletV4 over V5** — better documentation and wider ecosystem support
- **No backend** — all blockchain interaction via public toncenter.com API
- **No auto-refresh** — balance and transactions load once on Dashboard mount, manual refresh requires page reload
- **Node.js polyfills required** — @ton/ton uses Buffer internally, browser needs `vite-plugin-node-polyfills`

## Further Improvements

- Encrypt mnemonic with user password before storing
- Auto-refresh balance and transactions on interval
- Transaction fee estimation before sending
- Support WalletV5
- Migrate to mainnet with environment toggle
- Add transaction status polling after send (confirm it landed on-chain)
- Support TON deep links (`ton://transfer/...`) for easier address sharing
