import {mnemonicNew, mnemonicToPrivateKey} from '@ton/crypto'
import {WalletContractV4} from '@ton/ton'

// the type of wallet we return from both functions
export interface WalletData {
    mnemonic: string[]        // 24 words TON standard, stored in localStorage
    address: string           // address for display and transactions
}

// Create a new wallet (generates a random mnemonic)
export async function createWallet(): Promise<WalletData> {
    const mnemonic = await mnemonicNew(24)
    const address = await deriveAddress(mnemonic)
    return {mnemonic, address}
}

// Import an existing wallet from a mnemonic
export async function importWallet(mnemonic: string[]): Promise<WalletData> {
    const address = await deriveAddress(mnemonic)
    return {mnemonic, address}
}

// Internal function is to get an address from a mnemonic
export async function deriveAddress(mnemonic: string[]): Promise<string> {
    const keyPair = await mnemonicToPrivateKey(mnemonic)

    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0  // 0 - standard workchain in TON, 1 - masterchain, for validators.
    })

    // testOnly: true - important, testnet and mainnet addresses are different
    // bounceable: false - for regular transfers between wallets, TONs are not return if any errors.
    // Correct type for user-to-user transactions.
    return wallet.address.toString({testOnly: true, bounceable: false})
}
