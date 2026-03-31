# TON Testnet Wallet

A self-custodial TON testnet wallet built with React and TypeScript. No backend required.

## Features

- Create or import a wallet using a 24-word mnemonic
- View wallet address and balance
- Transaction history with search
- Receive TON — address display with copy button
- Send TON — with address substitution protection

## Address Substitution Protection

Friction by design — user cannot proceed on autopilot:

1. **Paste confirmation modal** — after pasting an address, shows first/last 6 characters and requires explicit confirmation. Protects against clipboard hijacking.
2. **New address warning** — yellow flag if the address has never been used in transaction history. Protects against copy-paste from chats or messages.
3. **Final confirmation screen** — shows full address and amount before sending, no automatic proceed. Applies to all scenarios.

## Tech Stack & Decision Log

**React** — familiar stack, rich ecosystem with crypto UI kits (e.g. @tonconnect/ui-react).

**useState navigation over React Router** — 4 screens don't justify the complexity of a full router.

**@ton/ton + @ton/crypto** — tonweb rejected as deprecated. As a backend developer: don't use unmaintained libraries. Official SDK, actively maintained.

**WalletV4 over V5** — V5 is newer but V4 is better documented. In an unfamiliar domain, good documentation matters more than new features.

**toncenter.com** — official TON Foundation API, native integration with TonClient. API key obtained via @tonapibot, stored in .env.

**localStorage** — task explicitly states production-grade security is not required. Mnemonic stored as-is, keys derived on every startup.

**TypeScript** — @ton/ton is written in TS, types come out of the box. Crypto code operates on Uint8Array, Buffer, Cell — type safety prevents errors at layer boundaries. As a Go developer, static typing is conceptually familiar.

**Address substitution protection — 4 UX layers (friction by design)**:
1. Paste confirmation modal — shows first/last 6 chars, requires explicit confirmation. Protects against clipboard hijacking.
2. New address warning — yellow flag if address not seen in transaction history. Protects against copy-paste from chats.
3. Final confirmation screen — full address and amount before sending, no auto-proceed.
4. Visual address splitting — address displayed in blocks for easier visual verification.

## Architecture
```
src/
├── crypto/          # key generation, address derivation, transaction signing
├── network/         # TON API client, balance and transaction fetching
├── storage/         # localStorage read/write
├── screens/         # Setup, Dashboard, Send, Receive
├── components/      # reusable UI components
└── hooks/           # shared React hooks
```

Navigation is implemented as a simple `useState<Screen>` — no React Router needed for 4 screens.

## Setup

1. Clone the repository and install dependencies:
```shell
npm install
```

2. Get a testnet API key from [@tonapibot](https://t.me/tonapibot) and create `.env`:
```
VITE_TONCENTER_API_KEY=your_key_here
```

3. Start the development server:
```shell
npm run dev
```

4. Get testnet TON from [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)

## Tradeoffs & Compromises

- Mnemonic stored in localStorage without encryption — acceptable per task requirements, not production-grade
- WalletV4 chosen over V5 — better documentation, wider ecosystem support
- No backend — all blockchain interaction via public toncenter.com API
- Rate limit ~1 req/s without API key — sufficient for testnet usage

## Further Improvements

- Encrypt mnemonic with user password before storing
- Add QR code on Receive screen
- Auto-refresh balance and transactions
- Support WalletV5
- Add transaction fee estimation before sending
- Migrate to mainnet with environment toggle
